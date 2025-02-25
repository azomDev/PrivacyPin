import "dart:convert";

import "package:flutter/material.dart";
import "package:privacypin/account_creation.dart";
import "package:privacypin/home.dart";
import "package:privacypin/storing.dart";
import "package:privacypin/utils.dart";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  bool isLoggedIn = await NativeStorage.isLoggedIn();
  List<User> friendList = [];
  if (isLoggedIn) {
    friendList = await fetchFriendList();
  }

  runApp(PrivacyPinApp(isLoggedIn: isLoggedIn, friendList: friendList));
}

Future<List<User>> fetchFriendList() async {
  final friendListJsonString = await NativeStorage.get("friends");
  return User.listFromJson(friendListJsonString ?? "[]");
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
