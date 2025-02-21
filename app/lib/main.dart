import "dart:convert";

import "package:flutter/material.dart";
import "package:privacypin/account_creation.dart";
import "package:privacypin/home.dart";
import "package:privacypin/server_api.dart";
import "package:privacypin/storing.dart";
import "package:privacypin/utils.dart";
import 'package:http/http.dart' as http;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  bool isLoggedIn = await NativeStorage.isLoggedIn();
  List<User> friendList = [];
  if (isLoggedIn) {
    friendList = await fetchFriendList();
  }

  // http.post(Uri.parse("http://127.0.0.1:8080/generate-signup-key"), body: "");

  // TEMP
  // isLoggedIn = true;
  // friendList = [];
  // await NativeStorage.store("user_id", "123");
  // await NativeStorage.store("server_url", "http://127.0.0.1:8080");
  // await NativeStorage.store("public_key", "temp");
  // await NativeStorage.store("private_key", "temp");

  runApp(PrivacyPinApp(isLoggedIn: isLoggedIn, friendList: friendList));
}

Future<List<User>> fetchFriendList() async {
  final friendListJsonString = await NativeStorage.get("friends");
  return jsonDecode(friendListJsonString);
}

class PrivacyPinApp extends StatelessWidget {
  final bool isLoggedIn;
  final List<User> friendList;

  const PrivacyPinApp(
      {super.key, required this.isLoggedIn, required this.friendList});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "PrivacyPin",
      // theme: ThemeData(
      //   useMaterial3: true,
      // ),
      home:
          isLoggedIn ? HomePage(friends: friendList) : AccountCreationScreen(),
    );
  }
}
