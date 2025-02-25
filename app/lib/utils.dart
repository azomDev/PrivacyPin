import 'dart:convert';

class User {
  String id;
  String username;
  bool amISending;

  // todo a local user (friend) also has a symmetrical key to encrypt messages like a tunnel.
  // We need to figure out where to store it securely. WIll it be stored with the rest of the values in User? Or will it be stored in a secure enclave? Or mabye something else?

  User(this.id, this.username, this.amISending);

  // Convert a User object to a Map
  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'amISending': amISending,
      };

  // Create a User object from a Map
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      json['id'],
      json['username'],
      json['amISending'],
    );
  }

  // Convert a list of Users to JSON string
  static String listToJson(List<User> users) {
    return jsonEncode(users.map((user) => user.toJson()).toList());
  }

  // Convert a JSON string back to a list of Users
  static List<User> listFromJson(String jsonString) {
    Iterable decoded = jsonDecode(jsonString);
    return List<User>.from(decoded.map((user) => User.fromJson(user)));
  }
}

class Ping {
  double latitude;
  double longitude;
  int timestamp;

  Ping(this.latitude, this.longitude, this.timestamp);

  factory Ping.fromJson(String json) {
    final decoded_json = jsonDecode(json);
    return Ping(
      decoded_json['latitude'],
      decoded_json['longitude'],
      decoded_json['timestamp'],
    );
  }

  static List<Ping> listFromJson(String jsonString) {
    Iterable decoded = jsonDecode(jsonString);
    return List<Ping>.from(decoded.map((ping) => Ping.fromJson(ping)));
  }
}
