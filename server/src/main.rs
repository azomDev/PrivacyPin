use std::{collections::HashMap, sync::Arc};

use axum::{
	Router,
	body::{Body, to_bytes},
	extract::{Request, State},
	middleware::Next,
	response::IntoResponse,
	routing::post,
};
use base64::{Engine, prelude::BASE64_STANDARD};
use ed25519_dalek::Signature;
use nanoid::nanoid;
use serde::Deserialize;
use std::collections::HashSet;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

mod handlers;
mod types;

use handlers::*;
use types::*;

#[tokio::main]
async fn main() {
	// TODO: should this be inside an Arc?
	let state = AppState {
		users: Arc::new(Mutex::new(Vec::new())),
		signup_keys: Arc::new(Mutex::new(HashSet::new())),
		friend_requests: Arc::new(Mutex::new(HashSet::new())),
		links: Arc::new(Mutex::new(HashSet::new())),
		positions: Arc::new(Mutex::new(HashMap::new())),
		admin_id: Arc::new(Mutex::new(None)),
		ring_buffer_cap: 5,
	};

	// Until we have disk saves, always generate a admin signup key since there will be no admin set at launch
	let admin_signup_key = nanoid!(5);
	println!("Admin signup key: {admin_signup_key}");
	println!("http://127.0.0.1:3000");
	state.signup_keys.lock().await.insert(admin_signup_key);

	// build our application with a route
	let app = Router::new()
		.route("/", post(|| async { "You just sent a POST to /" })) // for testing
		.route("/create-account", post(create_user))
		.route("/generate-signup-key", post(generate_signup_key))
		.route("/create-friend-request", post(create_friend_request))
		.route("/accept-friend-request", post(accept_friend_request))
		.route(
			"/is-friend-request-accepted",
			post(is_friend_request_accepted),
		)
		.route("/send-pings", post(send_pings))
		.route("/get-pings", post(get_pings))
		.with_state(state.clone())
		.layer(axum::middleware::from_fn_with_state(state, auth_test))
		.layer(CorsLayer::permissive());

	let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
	axum::serve(listener, app).await.unwrap();
}

async fn auth_test(State(state): State<AppState>, req: Request, next: Next) -> impl IntoResponse {
	let endpoint = req.uri().path().to_owned();
	if endpoint != "/create-account" {
		// CURSED STUFF BEGIN
		let (parts, body) = req.into_parts();
		let body_bytes = to_bytes(body, usize::MAX).await.unwrap();
		let new_body = Body::from(body_bytes.clone());
		let mut req = Request::from_parts(parts, new_body);
		// CURSED STUFF END

		let auth_header = req
			.headers()
			.get("x-auth")
			.and_then(|v| v.to_str().ok())
			.unwrap_or_else(|| panic!("missing x-auth header"));

		let decoded_auth = BASE64_STANDARD
			.decode(auth_header)
			.unwrap_or_else(|_| panic!("invalid base64 in x-auth header"));

		let auth_str = String::from_utf8(decoded_auth)
			.unwrap_or_else(|_| panic!("invalid utf8 in x-auth header"));

		let auth_data: Auth = serde_json::from_str(&auth_str)
			.unwrap_or_else(|e| panic!("failed to parse x-auth JSON: {e}"));

		let users = state.users.lock().await;
		let user_id = auth_data.user_id;
		let user = users
			.iter()
			.find(|u| u.id == user_id)
			.unwrap_or_else(|| panic!("User not found"));
		let verifying_key = user.pub_key.clone();
		drop(users);

		////////////////////////////////////
		//////////////////////////////////// unsure
		////////////////////////////////////

		let sig_vec = BASE64_STANDARD.decode(&auth_data.signature).unwrap();
		let sig_bytes: [u8; 64] = sig_vec.try_into().expect("invalid signature length");
		let signature = Signature::from_bytes(&sig_bytes);

		if let Err(err) = verifying_key.verify_strict(&body_bytes, &signature) {
			panic!("Signature verification failed: {err}");
		}

		////////////////////////////////////
		////////////////////////////////////
		////////////////////////////////////

		// TODO: Maybe make the endpoints an enum
		if endpoint == "/generate-signup-key" {
			let admin_id = state.admin_id.lock().await;
			if admin_id.as_ref() != Some(&user_id) {
				todo!("not allowed")
			}
		}

		req.extensions_mut().insert(user_id);

		return next.run(req).await;
	}

	return next.run(req).await;
}

#[derive(Debug, Deserialize, Clone)]
struct Auth {
	user_id: String,
	signature: String,
}
