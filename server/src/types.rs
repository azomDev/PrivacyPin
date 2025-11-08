use axum::{
	http::StatusCode,
	response::{IntoResponse, Response},
};
use ed25519_dalek::VerifyingKey;
use serde::{Deserialize, Serialize};
use std::{
	collections::{HashMap, HashSet},
	sync::Arc,
};
use tokio::sync::Mutex;

// doing everything in memory for now
#[derive(Clone)]
pub struct AppState {
	pub users: Arc<Mutex<Vec<User>>>,
	pub signup_keys: Arc<Mutex<HashSet<String>>>,
	pub friend_requests: Arc<Mutex<HashSet<Link>>>,
	pub links: Arc<Mutex<HashSet<Link>>>,
	pub positions: Arc<Mutex<HashMap<Link, RingBuffer>>>,
	pub admin_id: Arc<Mutex<Option<String>>>,
	pub ring_buffer_cap: usize,
}

pub struct RingBuffer {
	pub ring: Box<[Option<EncryptedPing>]>,
	pub idx: usize,
}

#[derive(Clone, Serialize)]
pub struct EncryptedPing(pub String);

// represents a ring buffer for a directed friend connection (ex.: user1 sending to user2, which in that case it's only user1's positions)
impl RingBuffer {
	pub fn new(capacity: usize) -> Self {
		return Self {
			ring: vec![None; capacity].into_boxed_slice(),
			idx: 0,
		};
	}

	pub fn add(&mut self, p: EncryptedPing) {
		self.idx = (self.idx + 1) % self.ring.len();
		self.ring[self.idx] = Some(p);
	}

	/// Returns a `Vec<String>` of all the `encrypted_ping` values in the ring buffer,
	/// starting from `self.idx` and iterating **backwards**, wrapping around to the end,
	/// skipping `None` entries.
	///
	/// # Notes
	/// - The first element in the returned vector corresponds to the current index (`self.idx`).
	/// - `None` entries are ignored.
	pub fn flatten(&self) -> Vec<EncryptedPing> {
		let len = self.ring.len();

		let mut result = Vec::with_capacity(len);

		for i in 0..len {
			let temp = (self.idx + len - i) % len;
			let position = &self.ring[temp];
			match position {
				Some(p) => result.push(p.clone()),
				None => continue,
			}
		}

		return result;
	}
}

#[derive(serde::Deserialize)]
pub struct CreateUserRequest {
	pub signup_key: String,
	pub pub_key_b64: String, // base64-encoded public key
}

#[derive(Debug, PartialEq, Eq)]
pub struct User {
	pub id: String,
	pub pub_key: VerifyingKey,
}
// pub struct User(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Link(String, String);

impl Link {
	pub fn new(a: String, b: String) -> Self {
		if a < b { Link(a, b) } else { Link(b, a) } // normalize order
	}
}

#[derive(Serialize)]
pub struct CreateAccountResponse {
	pub user_id: String,
	pub is_admin: bool,
}

#[derive(Deserialize)]
pub struct PingPayload {
	pub receiver_id: String,
	pub encrypted_ping: String,
}

pub struct PlainBool(pub bool);

impl IntoResponse for PlainBool {
	fn into_response(self) -> Response {
		self.0.to_string().into_response()
	}
}

#[derive(Serialize)]
pub struct EncryptedPingVec(pub Vec<EncryptedPing>);

impl IntoResponse for EncryptedPingVec {
	fn into_response(self) -> Response {
		axum::Json(self.0).into_response() // TODO: check if this is correct
	}
}

pub struct MyErr(pub &'static str);

impl IntoResponse for MyErr {
	fn into_response(self) -> Response {
		let body = format!(r#"{{"error":"{}"}}"#, self.0); // example: {"error":"something went wrong"}
		return (StatusCode::INTERNAL_SERVER_ERROR, body).into_response();
	}
}
