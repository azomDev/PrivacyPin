use axum::{Extension, Json, extract::State, response::Result};
use base64::{Engine, prelude::BASE64_STANDARD};
use ed25519_dalek::VerifyingKey;
use nanoid::nanoid;

use crate::types::*;

macro_rules! my_err {
	($msg:expr) => {
		Err(MyErr($msg))
	};
}

pub async fn create_user(
	State(state): State<AppState>, // TODO: some time ago, I change this (and all other handlers) to State(state): State<Arc<AppState>> no idea if I actually need it
	Json(payload): Json<CreateUserRequest>,
) -> Result<Json<CreateAccountResponse>, MyErr> {
	let key_used = { state.signup_keys.lock().await.remove(&payload.signup_key) };

	if !key_used {
		return my_err!("Signup key was not there");
	}

	// todo check
	let pub_key_bytes = match BASE64_STANDARD.decode(&payload.pub_key_b64) {
		Ok(b) => b,
		Err(_) => return my_err!("Invalid base64 public key"),
	};

	// todo check
	let pub_key = match VerifyingKey::from_bytes(
		&pub_key_bytes
			.try_into()
			.map_err(|_| MyErr("Invalid pubkey length".into()))?,
	) {
		Ok(pk) => pk,
		Err(_) => return my_err!("Invalid public key bytes"),
	};

	let user_id = nanoid!(5);
	let mut is_admin = false;
	let mut users = state.users.lock().await;
	if users.is_empty() {
		is_admin = true;
		let mut admin_id_guard = state.admin_id.lock().await;
		admin_id_guard.replace(user_id.clone());
	}

	users.push(User {
		id: user_id.clone(),
		pub_key,
	});

	return Ok(Json(CreateAccountResponse { user_id, is_admin }));
}

pub async fn generate_signup_key(State(state): State<AppState>) -> Result<String, MyErr> {
	let new_signup_key = nanoid!(5);
	let mut signup_keys = state.signup_keys.lock().await;

	// Assume new_signup_key will not collide
	signup_keys.insert(new_signup_key.clone());

	return Ok(new_signup_key);
}

pub async fn create_friend_request(
	State(state): State<AppState>,
	Extension(user_id): Extension<String>,
	accepter_id: String,
) -> Result<(), MyErr> {
	if accepter_id == user_id {
		return my_err!("Cannot friend yourself");
	}

	let mut friend_requests = state.friend_requests.lock().await;
	let link = Link::new(accepter_id, user_id);
	if friend_requests.contains(&link) {
		return my_err!("Friend request already exists");
	}
	friend_requests.insert(link);
	return Ok(());
}

pub async fn accept_friend_request(
	State(state): State<AppState>,
	Extension(user_id): Extension<String>,
	sender_id: String,
) -> Result<(), MyErr> {
	let link = Link::new(user_id, sender_id);

	let friend_request_accepted = { state.friend_requests.lock().await.remove(&link) };

	if !friend_request_accepted {
		return my_err!("Friend request not found");
	}

	let mut pings_state = state.positions.lock().await;
	pings_state.insert(link.clone(), RingBuffer::new(state.ring_buffer_cap));
	drop(pings_state);

	let mut links = state.links.lock().await;
	links.insert(link);

	return Ok(());
}

pub async fn is_friend_request_accepted(
	State(state): State<AppState>,
	Extension(user_id): Extension<String>,
	friend_id: String,
) -> Result<PlainBool, MyErr> {
	let link = Link::new(friend_id, user_id);
	let links = state.links.lock().await;
	let accepted = links.contains(&link);
	return Ok(PlainBool(accepted));
}

pub async fn send_pings(
	State(state): State<AppState>,
	Extension(user_id): Extension<String>,
	Json(pings): Json<Vec<PingPayload>>,
) -> Result<(), MyErr> {
	let links = state.links.lock().await;
	for ping in &pings {
		let link = Link::new(user_id.clone(), ping.receiver_id.clone());
		if !links.contains(&link) {
			return my_err!("Ping receiver is not linked to sender");
		}
	}
	drop(links);

	let mut pings_state = state.positions.lock().await;

	for ping in pings {
		let link = Link::new(user_id.clone(), ping.receiver_id.clone());
		pings_state
			.get_mut(&link)
			.unwrap()
			.add(EncryptedPing(ping.encrypted_ping)); // We assured that a ringbuffer exists because it was created when the link was created, hence the .unwrap()
	}

	return Ok(());
}

pub async fn get_pings(
	State(state): State<AppState>,
	Extension(user_id): Extension<String>,
	sender_id: String,
) -> Result<EncryptedPingVec, MyErr> {
	let link = Link::new(user_id, sender_id);
	let links = state.links.lock().await;

	if !links.contains(&link) {
		return my_err!("No link exists between these users");
	}
	drop(links);

	let pings = state.positions.lock().await;

	return Ok(EncryptedPingVec(pings.get(&link).unwrap().flatten())); // We assured that a ringbuffer exists because it was created when the link was created, hence the .unwrap()
}

// TODO: random idea, but use numbers instead of strings for user ids because no need to clone (but longer to read if needed)
// ANSWER: use number, but when showing or intputing on frontend, use base64 with frontend translation
