import 'package:shared_preferences/shared_preferences.dart';
import "package:flutter/services.dart";

class SettingsAPI {
  static late SharedPreferences _prefs;

  static Future<void> initializeSettingsAPI() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static T getSetting<T>(String key) {
    if (T == int) {
      return _prefs.getInt(key) as T;
    } else if (T == double) {
      return _prefs.getDouble(key) as T;
    } else if (T == bool) {
      return _prefs.getBool(key) as T;
    } else if (T == String) {
      return _prefs.getString(key) as T;
    } else {
      throw Exception("Unsupported type $T");
    }
  }

  static Future<T> getSettingOrDefault<T>(String key, T defaultValue) async {
    T value = getSetting(key);
    if (value == null) {
      setSetting<T>(key, defaultValue);
      return defaultValue;
    }
    return value;
  }

  static void setSetting<T>(String key, T value, {bool saveInKotlin = false}) async {
    if (saveInKotlin) {
      const platform = MethodChannel("com.example.app/my_channel");
      try {
        final String result = await platform.invokeMethod("changeSetting", {"key": key, "value": value as String});
        print(result);
      } on PlatformException catch (e) {
        print("Failed to send data to Kotlin: ${e.message}");
      }
    }

    if (T == int) {
      await _prefs.setInt(key, value as int);
    } else if (T == double) {
      await _prefs.setDouble(key, value as double);
    } else if (T == bool) {
      await _prefs.setBool(key, value as bool);
    } else if (T == String) {
      await _prefs.setString(key, value as String);
    } else {
      throw Exception("Unsupported type $T");
    }
  }
}

class KotlinAPI {
  static String _mapToString(Map<String, dynamic> inputMap) {
    List<String> keyValuePairs = inputMap.entries.map((entry) {
      return '"${entry.key}": "${entry.value}"';
    }).toList();

    return '{${keyValuePairs.join(', ')}}';
  }
}
