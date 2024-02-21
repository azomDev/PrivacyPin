import 'dart:convert';
import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import 'package:http/http.dart' as http;
import 'models.dart';

class ServerAPI {
  static Future<String> post(String body, String api_endpoint) async {
    final server_url = SettingsAPI.getSetting<String>(SettingName.serverUrl.toString());
    final url = Uri.parse("$server_url/$api_endpoint");
    final response = await http.post(url, headers: {'Content-Type': 'application/json'}, body: body);
    return response.body;
  }

  static Future<String> createAccount(String registration_key, String public_signing_key) async {
    final body = jsonEncode({"registration_key": registration_key, "public_signing_key": public_signing_key});
    return post(body, "create_account");
  }

  static Future<Ping> getPing(String user_id_to_get_from) async {
    final body = jsonEncode({"requested_user_id": user_id_to_get_from});
    final response_body = await post(body, "get_ping");
    return Ping.fromMap(jsonDecode(response_body));
  }

  static Future<void> updateLocationKey(SignedLocationKey signed_location_key) async {
    final body = jsonEncode(signed_location_key);
    await post(body, "update_location_key");
  }

  static Future<LocationKey> getLocationKey(String my_user_id, String sender_user_id) async {
    final body = jsonEncode({"sender_user_id": sender_user_id, "receiver_user_id": my_user_id});
    final response_body = await post(body, "get_location_key");
    return LocationKey.fromMap(jsonDecode(response_body));
  }
}
