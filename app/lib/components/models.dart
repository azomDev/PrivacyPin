import 'dart:convert';
import 'package:app/apis/crypto_utils.dart';
import 'package:app/apis/settings_api.dart';

class Position {
  double latitude;
  double longitude;

  Position.fromMap(Map<String, dynamic> map)
      : latitude = map["latitude"],
        longitude = map["longitude"];
}

class SignedLocationKey {
  String sender_user_id;
  String receiver_user_id;
  String location_key;
  String timestamp;
  String signature;

  SignedLocationKey(this.sender_user_id, this.receiver_user_id, this.location_key, this.timestamp, this.signature);

  SignedLocationKey.fromMap(Map<String, dynamic> map)
      : sender_user_id = map["sender_user_id"],
        receiver_user_id = map["receiver_user_id"],
        location_key = map["location_key"],
        timestamp = map["timestamp"],
        signature = map["signature"];
}

class Ping {
  String receiver_user_id;
  String sender_user_id;
  String encrypted_ping;
  String timestamp;

  Ping.fromMap(Map<String, dynamic> map)
      : receiver_user_id = map["receiver_user_id"],
        sender_user_id = map["receiver_user_id"],
        encrypted_ping = map["encrypted_ping"],
        timestamp = map["timestamp"];

  Future<Position> decrypt() async {
    String secret_key = await SettingsAPI.getUserSecretKey(sender_user_id);
    String decrypted_ping_string = await CryptoUtils.decrypt(encrypted_ping, secret_key);
    return Position.fromMap(jsonDecode(decrypted_ping_string));
  }
}

class User {
  String id;
  String username;
  bool am_i_sending;

  User.fromMap(Map<String, dynamic> map)
      : id = map["id"],
        username = map["username"],
        am_i_sending = map["am_i_sending"] == 1;

  Map<String, dynamic> toMap() {
    return {"id": id, "username": username, "am_i_sending": am_i_sending ? 1 : 0};
  }
}
