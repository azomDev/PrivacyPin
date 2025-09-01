use std::{
	collections::HashMap,
	sync::{Arc, Mutex},
};

use axum::{Router, handler::Handler, routing::post};

use std::collections::HashSet;

mod handlers;
mod types;

use handlers::*;
use types::*;

#[tokio::main]
async fn main() {
	// initialize tracing
	// tracing_subscriber::fmt::init();

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
		.route("/", post(plain_text))
		.route("/create-account", post(create_user))
		.route("/generate-signup-key", post(generate_signup_key))
		// .route(
		// "/generate-signup-key",
		// post(generate_signup_key.layer(axum::middleware::from_fn_with_state(state, f))), we can add admin middleware :D
		// )
		.route("/create-friend-request", post(create_friend_request))
		.route("/accept-friend-request", post(accept_friend_request))
		.route(
			"/is-friend-request-accepted",
			post(is_friend_request_accepted),
		)
		.route("/send-pings", post(send_pings))
		.route("/get-pings", post(get_pings))
		.with_state(state);

	// run our app with hyper, listening globally on port 3000
	let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
	axum::serve(listener, app).await.unwrap();
}

// TODO: for auth, I'll have to finalize the custom protocol (pain but fun)
// only then can I implement middleware

// temp to test
async fn plain_text() -> &'static str {
	"foo"
}
