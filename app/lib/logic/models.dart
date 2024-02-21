import 'dart:convert';
import 'package:app/logic/crypto_utils.dart';

class LocationKey {
  String sender_user_id;
  String receiver_user_id;
  String location_key;
  String timestamp;

  LocationKey.fromMap(Map<String, dynamic> map)
      : sender_user_id = map["sender_user_id"],
        receiver_user_id = map["receiver_user_id"],
        location_key = map["location_key"],
        timestamp = map["timestamp"];

  String decrypt(String secret_key) {
    return CryptoUtils.decrypt(location_key, secret_key);
  }
}

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
  String user_id;
  String encrypted_ping;
  String timestamp;

  Ping.fromMap(Map<String, dynamic> map)
      : user_id = map["user_id"],
        encrypted_ping = map["encrypted_ping"],
        timestamp = map["timestamp"];

  Position decrypt(String ping_decryption_key) {
    String decrypted_ping_string = CryptoUtils.decrypt(encrypted_ping, ping_decryption_key);
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
