use axum::{
	Json,
	extract::State,
	http::StatusCode,
	response::{IntoResponse, Response, Result},
};
use nanoid::nanoid;

use crate::types::*;

pub struct MyErr(pub &'static str);

// TODO: we should really have access in all endpoints to the verified user ID, that way we can save on bandwith and we can use that one instead of just random ones in the request.
// No idea how that would work with axum tho

impl IntoResponse for MyErr {
	fn into_response(self) -> Response {
		let body = format!(r#"{{"error":"{}"}}"#, self.0);
		return (StatusCode::INTERNAL_SERVER_ERROR, body).into_response();
	}
}

macro_rules! my_err {
	($msg:expr) => {
		Err(MyErr($msg))
	};
}

pub async fn create_user(
	State(state): State<AppState>,
	Json(payload): Json<CreateAccountRequest>,
) -> Result<Json<CreateAccountResponse>, MyErr> {
	let key_used = { state.signup_keys.lock().await.remove(&payload.signup_key) };

	if !key_used {
		return my_err!("Signup key was not there");
	}

	let user_id = nanoid!(5);
	let mut is_admin = false;
	let mut users = state.users.lock().await;
	if users.is_empty() {
		is_admin = true;
		let mut admin_id_guard = state.admin_id.lock().await;
		admin_id_guard.replace(user_id.clone());
	}

	users.push(User {
		user_id: user_id.clone(),
	});

	Ok(Json(CreateAccountResponse { user_id, is_admin }))
}

pub async fn generate_signup_key(
	State(state): State<AppState>,
	Json(payload): Json<GenerateSignupKeyRequest>,
) -> Result<Json<GenerateSignupKeyResponse>, MyErr> {
	let new_signup_key = nanoid!(5);
	let mut signup_keys = state.signup_keys.lock().await;

	// Assume new_signup_key will not collide
	signup_keys.insert(new_signup_key.clone());

	return Ok(Json(GenerateSignupKeyResponse {
		signup_key: new_signup_key,
	}));
}

pub async fn create_friend_request(
	State(state): State<AppState>,
	Json(payload): Json<CreateFriendRequestRequest>,
) -> Result<(), MyErr> {
	let accepter_id = payload.accepter_id;
	let sender_id = payload.sender_id;
	if accepter_id == sender_id {
		return my_err!("Cannot friend yourself");
	}

	let mut friend_requests = state.friend_requests.lock().await;
	let link = Link::new(accepter_id, sender_id);
	if friend_requests.contains(&link) {
		return my_err!("Friend request already exists");
	}
	friend_requests.insert(link);
	return Ok(());
}

pub async fn accept_friend_request(
	State(state): State<AppState>,
	Json(payload): Json<AcceptFriendRequestRequest>,
) -> Result<(), MyErr> {
	let link = Link::new(payload.accepter_id, payload.sender_id);

	let friend_request_accepted = { state.friend_requests.lock().await.remove(&link) };

	if !friend_request_accepted {
		return my_err!("Friend request not found");
	}

	{
		let mut pings_state = state.positions.lock().await;

		pings_state.insert(link.clone(), RingBuffer::new(state.ring_buffer_cap));
	} // TODO: in places where I ahve an extra scope, should I use drop() instead?

	let mut links = state.links.lock().await;
	links.insert(link);

	return Ok(());
}

pub async fn is_friend_request_accepted(
	State(state): State<AppState>,
	Json(payload): Json<IsFriendRequestAcceptedRequest>,
) -> Result<Json<IsFriendRequestAcceptedResponse>, MyErr> {
	let link = Link::new(payload.accepter_id, payload.sender_id);
	let links = state.links.lock().await;
	let accepted = links.contains(&link);
	return Ok(Json(IsFriendRequestAcceptedResponse { accepted }));
}

pub async fn send_pings(
	State(state): State<AppState>,
	Json(payload): Json<SendPingsRequest>,
) -> Result<(), MyErr> {
	let pings = payload.pings;

	let user_id = match pings.get(0) {
		Some(first) => first.sender_id.clone(),
		None => return my_err!("No pings provided"), // TODO: do we instead succeed directly?
	};

	{
		let links = state.links.lock().await;
		for ping in &pings {
			let link = Link::new(user_id.clone(), ping.receiver_id.clone());
			if !links.contains(&link) {
				return my_err!("Ping receiver is not linked to sender");
			}
		}
	}

	let mut pings_state = state.positions.lock().await;

	for ping in pings {
		let link = Link::new(user_id.clone(), ping.receiver_id.clone());
		pings_state.get_mut(&link).unwrap().add(ping); // We assured that a ringbuffer exists because it was created when the link was created
	}

	return Ok(());
}

pub async fn get_pings(
	State(state): State<AppState>,
	Json(payload): Json<GetPingsRequest>,
) -> Result<Json<GetPingsResponse>, MyErr> {
	let link = Link::new(payload.accepter_id, payload.sender_id);
	{
		let links = state.links.lock().await;

		if !links.contains(&link) {
			return my_err!("No link exists between these users");
		}
	}

	let pings = state.positions.lock().await;

	return Ok(Json(GetPingsResponse {
		pings: pings.get(&link).unwrap().flatten(), // We assured that a ringbuffer exists because it was created when the link was created
	}));
}
