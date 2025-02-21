class NativeStorage {
  // In-memory storage
  static final Map<String, String> _storage = {};

  // Store method to save data in memory
  static Future<void> store(String key, String value) async {
    _storage[key] = value;
  }

  // Get method to retrieve data from memory
  static Future<String> get(String key) async {
    return _storage[key]!;
  }

  static Future<bool> isLoggedIn() async {
    return _storage["user_id"] != null;
  }
}

// user_id
// private_key
// public_key
// server_url
// settings (many)
// friends
