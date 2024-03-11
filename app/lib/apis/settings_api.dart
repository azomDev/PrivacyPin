import 'package:app/apis/kotlin_api.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum SettingName<T> {
  themeMode<int>(default_value: 0, save_in_kotlin: false),
  pingFrequency<int>(default_value: 15, save_in_kotlin: true),
  serverUrl<String>(default_value: null, save_in_kotlin: true),
  userId<String>(default_value: null, save_in_kotlin: true),
  privateSigningKey<String>(default_value: null, save_in_kotlin: true),
  username<String>(default_value: null, save_in_kotlin: false),
  tempSwitcher<bool>(default_value: true, save_in_kotlin: false),
  isAdmin<bool>(default_value: null, save_in_kotlin: false);

  const SettingName({
    required this.default_value,
    required this.save_in_kotlin,
  });

  final T? default_value;

  Type get type => T;

  final bool save_in_kotlin;

  String get name => toString();
}

class SettingsAPI {
  static late SharedPreferences _prefs;

  static Future<void> initializeSettingsAPI() async {
    _prefs = await SharedPreferences.getInstance();

    for (SettingName setting_name in SettingName.values) {
      if (setting_name.default_value == null) continue;
      await setSetting(setting_name, setting_name.default_value);
    }
  }

  static Future<bool> isLoggedIn() async {
    return _prefs.getString(SettingName.userId.name) != null;
  }

  static Future<T> getSetting<T>(SettingName<T> setting) async {
    switch (setting.type) {
      case const (int):
        return _prefs.getInt(setting.name) as T;
      case const (double):
        return _prefs.getDouble(setting.name) as T;
      case const (bool):
        return _prefs.getBool(setting.name) as T;
      case const (String):
        return _prefs.getString(setting.name) as T;
      default:
        throw Exception("Unsupported type ${setting.type} or mabye $T idk");
    }
  }

  static Future<void> setSetting<T>(SettingName<T> setting, T value) async {
    if (setting.save_in_kotlin) {
      await KotlinAPI.changeSetting(setting, value);
    }
    switch (setting.type) {
      case const (int):
        await _prefs.setInt(setting.name, value as int);
        break;
      case const (double):
        await _prefs.setDouble(setting.name, value as double);
        break;
      case const (bool):
        await _prefs.setBool(setting.name, value as bool);
        break;
      case const (String):
        await _prefs.setString(setting.name, value as String);
        break;
      default:
        throw Exception("Unsupported type ${setting.type} or mabye $T idk");
    }
  }

  static Future<String> getUserSecretKey(String user_id) async {
    return _prefs.getString(user_id)!;
  }

  static Future<void> setUserSecretKey(String user_id, String key) async {
    await _prefs.setString(user_id, key);
  }
}
