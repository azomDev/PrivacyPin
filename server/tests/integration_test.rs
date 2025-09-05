mod server;
mod utils;

use server::TestServer; // Use RAII guard
use utils::{generate_user, post};

#[test]
fn integration_flow() {
	// Start server; it will be automatically stopped when `server` goes out of scope
	let server = TestServer::start();

	// Create admin user
	let admin_id = generate_user(Some(server.signup_key()), true);
	assert!(!admin_id.is_empty());

	// Create normal user
	let user_id = generate_user(Some(server.signup_key()), false);
	assert!(!user_id.is_empty());

	// Example: send some POST requests as admin
	let resp1 = post("do-something", &admin_id, Some(r#"{ "foo": "bar" }"#));
	assert!(
		resp1.contains("success"),
		"Expected success response, got: {}",
		resp1
	);

	// Example: send some POST requests as normal user
	let resp2 = post("do-something-else", &user_id, None);
	assert!(resp2.contains("ok"), "Expected ok response, got: {}", resp2);

	// No need to call stop_server(); TestServer Drop handles it
}
