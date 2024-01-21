import 'package:app/logic/kotlin_api.dart';

import 'preferences_api.dart';

class SettingAPI {
  static saveSetting<T>(bool saveInKotlin, String key, T value) async {
    if (saveInKotlin) {
      KotlinAPI.setSharedPreference({"key": key, "value": value as String});
    }

    SharedPreferencesAPI.setPreference<T>(key, value);
  }

  static dynamic loadSetting<T>(String key) async {
    return SharedPreferencesAPI.getPreference<T>(key);
  }
}
