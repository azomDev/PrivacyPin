use std::{collections::HashMap, sync::Arc};

use axum::{
	Router,
	extract::{Request, State},
	middleware::Next,
	response::IntoResponse,
	routing::post,
};
use serde::Deserialize;
use tokio::sync::Mutex;

use std::collections::HashSet;

mod handlers;
mod types;

use handlers::*;
use types::*;

#[tokio::main]
async fn main() {
	// initialize tracing
	// tracing_subscriber::fmt::init();

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
		.layer(axum::middleware::from_fn_with_state(state, auth_test));

	// run our app with hyper, listening globally on port 3000
	let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
	axum::serve(listener, app).await.unwrap();
}

async fn auth_test(
	State(state): State<AppState>,
	mut req: Request,
	next: Next,
) -> impl IntoResponse {
	let endpoint = req.uri().path();
	if endpoint != "/create-account" {
		let auth_header = match req.headers().get("x-auth").and_then(|v| v.to_str().ok()) {
			Some(h) => h,
			None => todo!("header issues"),
		};

		let auth_data: Auth = match serde_json::from_str(&auth_header) {
			Ok(v) => v,
			Err(_) => todo!("parsing json issues"),
		};

		let users = state.users.lock().await;
		let user_id = auth_data.user_id;
		if !users.contains(&User(user_id.clone())) {
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

		req.extensions_mut().insert(user_id);
	}

	next.run(req).await
}

// For now, only user_id for identification
#[derive(Debug, Deserialize, Clone)]
struct Auth {
	user_id: String,
}
