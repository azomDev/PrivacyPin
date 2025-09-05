use std::env;
use std::process::{Child, Command};
use std::sync::{Mutex, OnceLock};
use std::time::Duration;

static SERVER: OnceLock<Mutex<Option<Child>>> = OnceLock::new();

/// RAII guard for a test server: stops the server when dropped.
pub struct TestServer {
	signup_key: String,
}

impl TestServer {
	pub fn start() -> Self {
		// Stop any previous server
		stop_server();

		let bin = env!("CARGO_BIN_EXE_rust-server");
		let signup_key = String::from("asdf");

		let child = Command::new(bin)
			.env("ADMIN_SIGNUP_KEY", &signup_key)
			.spawn()
			.expect("Failed to start server");

		// Save child in global
		SERVER.get_or_init(|| Mutex::new(None));
		if let Some(lock) = SERVER.get() {
			*lock.lock().unwrap() = Some(child);
		}

		std::thread::sleep(Duration::from_millis(200));

		return TestServer { signup_key };
	}

	pub fn signup_key(&self) -> &str {
		&self.signup_key
	}
}

impl Drop for TestServer {
	fn drop(&mut self) {
		stop_server(); // guaranteed cleanup even on panic
	}
}

/// Stop the global server, if running
pub fn stop_server() {
	if let Some(lock) = SERVER.get() {
		let mut guard = lock.lock().unwrap();
		if let Some(mut child) = guard.take() {
			let _ = child.kill();
			let _ = child.wait(); // ensure the OS releases the port
		}
	}
}
