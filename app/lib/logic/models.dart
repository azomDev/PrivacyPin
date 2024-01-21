class Person {
  String id;
  String username;

  Person(this.id, this.username);

  // Create a Person object from a map
  Person.fromMap(Map<String, dynamic> map)
      : id = map["id"],
        username = map["username"];

  // Convert Person object to a map
  Map<String, dynamic> toMap() {
    return {"id": id, "username": username};
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
