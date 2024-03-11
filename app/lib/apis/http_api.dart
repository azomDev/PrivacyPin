import 'dart:convert';
import 'package:app/apis/crypto_utils.dart';
import 'package:app/apis/settings_api.dart';
import 'package:http/http.dart' as http;
import '../components/models.dart';

class ServerAPI {
  static Future<String> _post(String body, String api_endpoint) async {
    final server_url = await SettingsAPI.getSetting(SettingName.serverUrl);
    final url = Uri.parse("$server_url/$api_endpoint");
    final response = await http.post(url, headers: {'Content-Type': 'application/json'}, body: body);
    return response.body;
  }

  static Future<Map<String, dynamic>> createAccount(String registration_key, String public_signing_key) async {
    final body = jsonEncode({"registration_key": registration_key, "public_signing_key": public_signing_key});
    String response_body = await _post(body, "create_account");
    return jsonDecode(response_body);
  }

  static Future<Ping> getPing(String user_id_to_get_from) async {
    String my_user_id = await SettingsAPI.getSetting(SettingName.userId);
    String body = jsonEncode({"sender_user_id": user_id_to_get_from, "receiver_user_id": my_user_id});
    String response_body = await _post(body, "get_ping");
    return Ping.fromMap(jsonDecode(response_body));
  }

  static Future<void> generateRegistrationKey() async {
    String my_user_id = await SettingsAPI.getSetting(SettingName.userId);
    String timestamp = DateTime.now().toIso8601String();
    String signature = await CryptoUtils.sign(my_user_id + timestamp);
    String body = jsonEncode({"admin_user_id": my_user_id, "timestamp": timestamp, "signature": signature});
    await _post(body, "admin/generate_registration_key");
  }

  static Future<void> clearRegistrationKeys() async {
    String my_user_id = await SettingsAPI.getSetting(SettingName.userId);
    String timestamp = DateTime.now().toIso8601String();
    String signature = await CryptoUtils.sign(my_user_id + timestamp);
    String body = jsonEncode({"admin_user_id": my_user_id, "timestamp": timestamp, "signature": signature});
    await _post(body, "admin/clear_registration_keys");
  }
}
