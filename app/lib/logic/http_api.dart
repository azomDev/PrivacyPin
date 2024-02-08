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

  static Future<String> createAccount(String username) async {
    final body = jsonEncode({"username": username});
    return post(body, "create_account");
  }

  static Future<Ping> getPing(String user_id_to_get_from) async {
    final body = jsonEncode({"user_id_to_get_from": user_id_to_get_from});
    final response_body = await post(body, "get_ping");
    final Map<String, dynamic> response_data = jsonDecode(response_body);
    return Ping.fromMap(response_data);
  }

  // [{"id":"8d432e14-4ba3-41ff-be84-7d42c0d410c7","username":"oi"},{"id":"1dca4a47-1d78-4533-8133-335122869807","username":"test2"},{"id":"4b1092ad-af54-47c3-a44d-441011409af6","username":"test"},{"id":"8f94ea08-9356-48a5-a45a-213af540f25d","username":"a_name"}]
  static Future<List<User>> getAllUsers() async {
    final server_url = SettingsAPI.getSetting<String>(SettingName.serverUrl.toString());
    final url = Uri.parse("$server_url/get_all_users");
    final response = await http.get(url);

    List<Map<String, dynamic>> jsonData = (jsonDecode(response.body) as List).cast<Map<String, dynamic>>();

    List<User> users = jsonData.map((map) => User.fromMap(map)).toList();
    return users;
  }

  static Future<void> createLink(String receiver_user_id) async {
    final my_user_id = SettingsAPI.getSetting<String>(SettingName.userId.toString());
    final body = jsonEncode({"sender_user_id": my_user_id, "receiver_user_id": receiver_user_id});
    await post(body, "create_link");
  }

  static Future<List<Link>> getLinks() async {
    final my_user_id = SettingsAPI.getSetting<String>(SettingName.userId.toString());
    final body = jsonEncode({"my_user_id": my_user_id});
    final response_body = await post(body, "get_links");
    List<Map<String, dynamic>> jsonData = (jsonDecode(response_body) as List).cast<Map<String, dynamic>>();
    List<Link> links = jsonData.map((map) => Link.fromMap(map)).toList();
    return links;
  }

  static Future<void> modifyLink(String receiver_user_id, bool new_value) async {
    final my_user_id = SettingsAPI.getSetting<String>(SettingName.userId.toString());
    final body = jsonEncode({"sender_user_id": my_user_id, "receiver_user_id": receiver_user_id, "am_i_sending": new_value});
    await post(body, "modify_link");
  }
}
