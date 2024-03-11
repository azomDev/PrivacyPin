import 'package:app/apis/kotlin_api.dart';
import 'package:app/apis/settings_api.dart';

class CryptoUtils {
  static Future<String> generateSigningKeyPair() async {
    final keys = await KotlinAPI.generateSigningKeyPair();
    await SettingsAPI.setSetting(SettingName.privateSigningKey, keys["private"]!);
    return keys["public"]!;
  }

  static Future<String> sign(String data) async {
    return await KotlinAPI.sign(data);
    // sign data using stored private signing key using dilithium and return the signature
  }

  static Future<String> decrypt(String encrypted_data, String secret_key) async {
    return await KotlinAPI.decrypt(encrypted_data, secret_key);
    // decrypt data using the secret_key using AES
  }

  static Future<String> generateSecretKey() async {
    return await KotlinAPI.generateSecretKey();
  }
}
