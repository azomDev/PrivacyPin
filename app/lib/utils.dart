class User {
  String id;
  String username;
  bool amISending;
  // todo a local user (friend) also has a symmetrical key to encrypt messages like a tunnel.
  // We need to figure out where to store it securely. WIll it be stored with the rest of the values in User? Or will it be stored in a secure enclave? Or mabye something else?

  User(this.id, this.username, this.amISending);

  User.fromMap(Map<String, dynamic> map)
      : id = map["id"],
        username = map["username"],
        amISending = map["am_i_sending"];

  Map<String, dynamic> toMap() {
    return {"id": id, "username": username, "am_i_sending": amISending};
  }
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
