import 'package:shared_preferences/shared_preferences.dart';

class NativeStorage {
  static Future<void> store(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  static Future<String?> get(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey("user_id");
  }
}

// user_id
// private_key
// public_key
// server_url
// settings (many)
// friends

// later do an enum or something for the keys so it's consistent
