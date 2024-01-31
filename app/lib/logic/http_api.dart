import 'dart:convert';
import 'package:app/logic/preferences_api.dart';
import 'package:http/http.dart' as http;

import 'models.dart';

class ServerAPI {
  static Future<String> createAccount(String username, String serverUrl) async {
    final url = Uri.parse('$serverUrl/create_account');
    final body = jsonEncode({'username': username});

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );

    return response.body;
  }

  static Future<Ping> getPing(String userIdToGetFrom) async {
    final serverUrl = await SharedPreferencesAPI.getPreference<String>("server_url");
    final url = Uri.parse('$serverUrl/get_ping');
    final body = jsonEncode({'user_id_to_get_from': userIdToGetFrom});

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> responseData = jsonDecode(response.body); //? To test
      return Ping.fromMap(responseData);
    } else {
      throw Exception('Failed to fetch ping');
    }
  }

  static Future<List<Person>> getAllUsers() async {
    final serverUrl = await SharedPreferencesAPI.getPreference<String>("server_url");
    final url = Uri.parse('$serverUrl/get_all_users');

    final response = await http.get(url);

    if (response.statusCode == 200) {
      List<Map<String, dynamic>> jsonData = (jsonDecode(response.body) as List).cast<Map<String, dynamic>>();

      List<Person> persons = jsonData.map((map) => Person.fromMap(map)).toList();
      return persons;
    } else {
      throw Exception('Failed to fetch all users');
    }
  }
}
