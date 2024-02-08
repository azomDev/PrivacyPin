import 'package:shared_preferences/shared_preferences.dart';
import "package:flutter/services.dart";

class SettingsAPI {
  static late SharedPreferences _prefs;

  static Future<void> initializeSettingsAPI() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static T? getSetting<T>(String key) {
    switch (T) {
      case const (int):
        return _prefs.getInt(key) as T?;
      case const (double):
        return _prefs.getDouble(key) as T?;
      case const (bool):
        return _prefs.getBool(key) as T?;
      case const (String):
        return _prefs.getString(key) as T?;
      default:
        throw Exception("Unsupported type $T");
    }
  }

  static Future<T> getSettingOrSetDefault<T>(String key, T default_value) async {
    T? value = getSetting<T>(key);
    if (value == null) {
      setSetting<T>(key, default_value);
      return default_value;
    }
    return value;
  }

  static Future<void> setSetting<T>(String key, T value, {bool save_in_kotlin = false}) async {
    if (save_in_kotlin) {
      const platform = MethodChannel("com.example.app/my_channel");
      try {
        final String result = await platform.invokeMethod("changeSetting", {"key": key, "value": value as String});
        // TODO update to match kotlin better
        print(result);
      } on PlatformException catch (e) {
        print("Failed to send data to Kotlin: ${e.message}");
      }
    }

    switch (T) {
      case const (int):
        await _prefs.setInt(key, value as int);
      case const (double):
        await _prefs.setDouble(key, value as double);
      case const (bool):
        await _prefs.setBool(key, value as bool);
      case const (String):
        await _prefs.setString(key, value as String);
      default:
        throw Exception("Unsupported type $T");
    }
  }
}
