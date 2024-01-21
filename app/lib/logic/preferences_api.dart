import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesAPI {
  static dynamic getPreference<T>(String key) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    if (T == int) {
      return prefs.getInt(key);
    } else if (T == double) {
      return prefs.getDouble(key);
    } else if (T == bool) {
      return prefs.getBool(key);
    } else if (T == String) {
      return prefs.getString(key);
    } else {
      throw Exception("Unsupported type $T");
    }
  }

  static Future<void> setPreference<T>(String key, T value) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    if (T == int) {
      await prefs.setInt(key, value as int);
    } else if (T == double) {
      await prefs.setDouble(key, value as double);
    } else if (T == bool) {
      await prefs.setBool(key, value as bool);
    } else if (T == String) {
      await prefs.setString(key, value as String);
    } else {
      // Handle other types or throw an exception for unsupported types
      throw Exception("Unsupported type");
    }
  }
}
