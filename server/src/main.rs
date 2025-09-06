use std::env;
use std::sync::Arc;

use axum::{
	Router,
	extract::{Request, State},
	middleware::Next,
	response::IntoResponse,
	routing::post,
};
use base64::{Engine, prelude::BASE64_STANDARD};
use ed25519_dalek::{Signature, VerifyingKey};
use nanoid::nanoid;
use serde::Deserialize;

mod handlers;
mod types;

use handlers::*;
use types::*;

#[tokio::main]
async fn main() {
	// initialize tracing
	// tracing_subscriber::fmt::init();

	let state = AppState::new(5);

	// Until we have disk saves, always generate a admin signup key since there will be no admin set at launch
	let admin_signup_key = match env::var("ADMIN_SIGNUP_KEY") {
		Ok(_) => String::from("asdf"),
		Err(_) => nanoid!(5),
	};

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
		.layer(axum::middleware::from_fn_with_state(state, auth));

	// run our app with hyper, listening globally on port 3000
	let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
	axum::serve(listener, app).await.unwrap();
}

async fn auth(
	State(state): State<Arc<AppState>>,
	mut req: Request,
	next: Next,
	// TODO: return result
) -> impl IntoResponse {
	let endpoint = req.uri().path();
	if endpoint != "/create-account" {
		let auth_header = match req.headers().get("x-auth").and_then(|v| v.to_str().ok()) {
			Some(h) => h,
			None => todo!("header issues"),
		};

		let auth_data: AuthData = match serde_json::from_str(&auth_header) {
			Ok(v) => v,
			Err(_) => todo!("parsing json issues"),
		};

		let users = state.users.lock().await;
		let user_id = auth_data.user_id;

		if !users.iter().any(|u| u.id == user_id) {
			todo!("not allowed")
		}
		drop(users);

		// TODO: Maybe make the endpoints an enum
		if endpoint == "/generate-signup-key" {
			let admin_id = state.admin_id.lock().await;
			if admin_id.as_ref() != Some(&user_id) {
				todo!("not allowed")
			}
		}

		// TODO: OOPS we need to use the pkey in the db to verify the incoming signature. Then we can store the new pkey in the db
		let pkey_bytes = parse_base64::<32>(&auth_data.pkey).unwrap(); // TODO: don't use .unwrap
		let pkey = VerifyingKey::from_bytes(&pkey_bytes).unwrap(); // TODO: don't use .unwrap

		let signature_bytes = parse_base64::<64>(&auth_data.signature).unwrap(); // TODO: don't use .unwrap
		let signature = Signature::from_bytes(&signature_bytes);

		pkey.verify_strict(TODO, &signature);

		// TODO: Save new public key

		req.extensions_mut().insert(user_id);
	}

	next.run(req).await
}

// TODO: is this function correct?
fn parse_base64<const N: usize>(data: &str) -> Result<[u8; N], String> {
	let decoded = BASE64_STANDARD
		.decode(data)
		.map_err(|e| format!("base64 decode error: {e}"))?;

	let len = decoded.len();

	decoded
		.try_into()
		.map_err(|_| format!("expected {N} bytes, got {len}"))
}

// For now, only user_id for identification
#[derive(Debug, Deserialize, Clone)]
struct AuthData {
	user_id: String,
	pkey: String, // Base64
	signature: String,
}
