use serde::{Deserialize, Serialize};
use std::{
	collections::{HashMap, HashSet},
	sync::{Arc, Mutex},
};

// doing everything in memory for now
#[derive(Clone)]
pub struct AppState {
	pub users: Arc<Mutex<Vec<User>>>,
	pub signup_keys: Arc<Mutex<HashSet<String>>>,
	pub friend_requests: Arc<Mutex<HashSet<Link>>>,
	pub links: Arc<Mutex<HashSet<Link>>>,
	pub positions: Arc<Mutex<HashMap<Link, RingBuffer>>>,
	pub admin_id: Arc<Mutex<Option<String>>>, // TODO: Is Arc and Mutex needed?
	pub ring_buffer_cap: usize,
}

pub struct RingBuffer {
	pub ring: Box<[Option<Position>]>,
	pub idx: usize,
}

// represents a ring buffer for a directed friend connection (ex.: user1 sending to user2, which here it's only user1's positions)
impl RingBuffer {
	pub fn new(capacity: usize) -> Self {
		return Self {
			ring: vec![None; capacity].into_boxed_slice(),
			idx: 0,
		};
	}

	pub fn add(&mut self, p: Ping) {
		self.idx = (self.idx + 1) % self.ring.len();
		self.ring[self.idx] = Some(Position {
			sender_id: p.sender_id,
			receiver_id: p.receiver_id,
			encrypted_ping: p.encrypted_ping,
			recency_index: self.idx,
		});
	}

	/// Returns a `Vec<String>` of all the `encrypted_ping` values in the ring buffer,
	/// starting from `self.idx` and iterating **backwards**, wrapping around to the end,
	/// skipping `None` entries.
	///
	/// # Notes
	/// - The first element in the returned vector corresponds to the current index (`self.idx`).
	/// - `None` entries are ignored.
	pub fn flatten(&self) -> Vec<String> {
		let len = self.ring.len();

		let mut result = Vec::with_capacity(len);

		for i in 0..len {
			let temp = (self.idx - i + len) % len;
			let position = &self.ring[temp];
			match position {
				Some(p) => result.push(p.encrypted_ping.clone()),
				None => continue,
			}
		}

		return result;
	}
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
	pub user_id: String,
}

// TODO: maybe add equivalent to: UNIQUE(sender_id, receiver_id, recency_index)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Position {
	pub sender_id: String,
	pub receiver_id: String,
	pub encrypted_ping: String,
	pub recency_index: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Link(String, String);

impl Link {
	pub fn new(a: String, b: String) -> Self {
		if a < b { Link(a, b) } else { Link(b, a) } // normalize order
	}
}

#[derive(Deserialize, Clone)]
pub struct CreateAccountRequest {
	pub signup_key: String,
}

#[derive(Serialize)]
pub struct CreateAccountResponse {
	pub user_id: String,
	pub is_admin: bool,
}

#[derive(Deserialize, Clone)]
pub struct GenerateSignupKeyRequest {
	pub signup_key: String, // TODO: no actual data normally, what do we do?
}

#[derive(Serialize)]
pub struct GenerateSignupKeyResponse {
	pub signup_key: String,
}

#[derive(Deserialize, Clone)]
// TODO: change Request for another name LOL
pub struct CreateFriendRequestRequest {
	pub sender_id: String,
	pub accepter_id: String,
}

#[derive(Deserialize, Clone)]
pub struct AcceptFriendRequestRequest {
	pub sender_id: String,
	pub accepter_id: String,
}

#[derive(Deserialize, Clone)]
pub struct IsFriendRequestAcceptedRequest {
	pub sender_id: String,
	pub accepter_id: String,
}

#[derive(Serialize)]
pub struct IsFriendRequestAcceptedResponse {
	pub accepted: bool,
}

#[derive(Deserialize, Clone)]
pub struct Ping {
	pub sender_id: String,
	pub receiver_id: String,
	pub encrypted_ping: String,
}

#[derive(Deserialize, Clone)]
pub struct SendPingsRequest {
	pub pings: Vec<Ping>,
}

#[derive(Deserialize, Clone)]
pub struct GetPingsRequest {
	pub sender_id: String,
	pub accepter_id: String,
}

#[derive(Serialize)]
pub struct GetPingsResponse {
	pub pings: Vec<String>,
}
