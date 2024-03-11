import 'dart:convert';

import 'package:app/apis/settings_api.dart';
import 'package:flutter/services.dart';

class KotlinAPI {
  static late MethodChannel _platform;

  static void initialize() {
    _platform = const MethodChannel("com.example.app/my_channel");
  }

  static Future<Map<String, String>> generateSigningKeyPair() async {
    // Map<String, String> map = Map.castFrom(jsonDecode(await _platform.invokeMethod("generateSigningKeyPair")));
    return Map.castFrom(jsonDecode(await _platform.invokeMethod("generateSigningKeyPair"))); // todo pass map from kotlin then use directly Map.castFrom()?
  }

  static Future<String> sign(String data) async {
    return await _platform.invokeMethod("sign", {"data": data}) as String; // todo as String needed?
  }

  static Future<String> decrypt(String encrypted_data, String secret_key) async {
    return await _platform.invokeMethod("decrypt", {"encrypted_data": encrypted_data, "secret_key": secret_key}) as String;
  }

  static Future<String> generateSecretKey() async {
    return await _platform.invokeMethod("generateSecretKey") as String;
  }

  static Future<void> changeSetting<T>(SettingName<T> setting_name, T value) async {
    await _platform.invokeMethod("changeSetting", {"key": setting_name.name, "value": value});
  }
}
