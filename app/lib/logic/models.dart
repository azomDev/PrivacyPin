class User {
  String id;
  String username;

  User(this.id, this.username);

  // Create a User object from a map
  User.fromMap(Map<String, dynamic> map)
      : id = map["id"],
        username = map["username"];

  // Convert User object to a map
  Map<String, dynamic> toMap() {
    return {"id": id, "username": username};
  }
}

class Link {
  String id;
  String receiver_user_id;
  bool am_i_sending;

  Link(this.id, this.receiver_user_id, this.am_i_sending);

  Link.fromMap(Map<String, dynamic> map)
      : id = map["id"],
        receiver_user_id = map["receiver_user_id"],
        am_i_sending = map["am_i_sending"];
}

class Ping {
  double latitude;
  double longitude;
  int timestamp;

  Ping(this.latitude, this.longitude, this.timestamp);

  Ping.fromMap(Map<String, dynamic> map)
      : latitude = map["latitude"],
        longitude = map["longitude"],
        timestamp = map["timestamp"];
}
