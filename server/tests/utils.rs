use std::io::{Read, Write};
use std::net::TcpStream;

/// Perform a raw HTTP request and return `(status_code, body)`
fn http_post(path: &str, headers: &[(&str, String)], body: &str) -> (u16, String) {
	let mut stream = TcpStream::connect("127.0.0.1:3000").expect("failed to connect");

	let mut request = format!(
		"POST {} HTTP/1.1\r\nHost: localhost\r\nContent-Length: {}\r\n",
		path,
		body.len()
	);

	for (k, v) in headers {
		request.push_str(&format!("{}: {}\r\n", k, v));
	}

	request.push_str("\r\n");
	request.push_str(body);

	stream.write_all(request.as_bytes()).unwrap();

	let mut response = String::new();
	stream.read_to_string(&mut response).unwrap();

	println!("This never prints ============================================");

	let mut parts = response.split("\r\n\r\n");
	let headers = parts.next().unwrap_or("");
	let body = parts.next().unwrap_or("").to_string();

	let status_line = headers.lines().next().unwrap_or("");
	let status_code: u16 = status_line
		.split_whitespace()
		.nth(1)
		.unwrap_or("0")
		.parse()
		.unwrap_or(0);

	(status_code, body)
}

pub fn generate_user(signup_key: Option<&str>, should_be_admin: bool) -> String {
	let signup_key =
		signup_key.expect("signup_key was not provided or captured from server output");

	let (status, body) = http_post("/create-account", &[], signup_key);
	assert_eq!(status, 200, "Expected 200, got {}", status);

	// Naively parse JSON
	let body = body.trim();
	assert!(body.contains("\"user_id\""));
	assert!(body.contains(&format!("\"is_admin\":{}", should_be_admin)));

	// Extract user_id manually (since no serde/json)
	let user_id = body
		.split("\"user_id\":\"")
		.nth(1)
		.and_then(|s| s.split('"').next())
		.expect("Failed to parse user_id")
		.to_string();

	user_id
}

pub fn post(endpoint: &str, user_id: &str, data: Option<&str>) -> String {
	let mut headers: Vec<(&str, String)> =
		vec![("x-auth", format!(r#"{{"user_id":"{}"}}"#, user_id))];

	let mut body = String::new();

	if let Some(d) = data {
		body = d.to_string();
		headers.push(("Content-Type", "application/json".to_string()));
	}

	let (status, body) = http_post(&format!("/{}", endpoint), &headers, &body);

	assert_eq!(status, 200, "Expected 200, got {}", status);

	body
}
