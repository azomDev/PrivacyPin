import "package:flutter/material.dart";
import "package:privacypin/account_creation.dart";
import "package:privacypin/home.dart";
import "package:privacypin/utils.dart";

// todo for now, for error handling, only check user inputs where there is some, assume the server is always up and running and always give back the right response
// We only need to store in the app:
// - settings (and user id counts in that since it's a single value)
// - friend list (although we don't know what to do with the symmetrical key yet)
// - private signature key (this is not in the settings part since it needs to be stored securely)

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  bool isLoggedIn = await checkLoginStatus();
  List<User> friendList = [];
  if (isLoggedIn) {
    friendList = await fetchFriendList();
  }

  runApp(PrivacyPinApp(isLoggedIn: isLoggedIn, friendList: friendList));
}

Future<List<User>> fetchFriendList() async {
  // todo fetch friend list from whatever persistent storage we are using (btw native does need to access it too)
  return [
    User("1", "Alice", true),
    User("2", "Bob", false),
    User("3", "Charlie", true),
  ];
}

Future<bool> checkLoginStatus() async {
  // todo check if user is logged in by checking if the user id is present in whatever persistent storage we are using (btw native does need to access it too)
  return true;
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
