import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:privacypin/home.dart';
import 'package:privacypin/server_api.dart';
import 'package:privacypin/storing.dart';
import 'package:privacypin/utils.dart';

class AddFriendWidget extends StatelessWidget {
  const AddFriendWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController usernameController = TextEditingController();
    final TextEditingController userIdController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: usernameController,
            decoration: const InputDecoration(labelText: "Username"),
          ),
          TextField(
            controller: userIdController,
            decoration: const InputDecoration(labelText: "User ID"),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton(
                onPressed: () async {
                  String userId = userIdController.text;
                  final myUserId = await NativeStorage.get("user_id");
                  await post(
                      "/create-friend-request",
                      jsonEncode({
                        "sender_id": myUserId,
                        "accepter_id": userId,
                      }));

                  bool isFriend = false;

                  while (!isFriend) {
                    final response = await post(
                        "/is-friend-request-accepted",
                        jsonEncode({
                          "sender_id": myUserId,
                          "accepter_id": userId,
                        }));

                    await Future.delayed(const Duration(seconds: 1));
                    isFriend = response == "true";
                  }

                  // todo adding the friend is not done proprely here and below
                  final friendListJsonString =
                      await NativeStorage.get("friends");

                  final List<User> friendList =
                      User.listFromJson(friendListJsonString ?? "[]");
                  friendList.add(User(userId, usernameController.text, true));
                  await NativeStorage.store(
                      "friends", User.listToJson(friendList));
                  // now we need to show the home page
                  if (!context.mounted) return;
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HomePage(friends: friendList),
                    ),
                  );
                },
                child: const Text("Send"),
              ),
              ElevatedButton(
                onPressed: () async {
                  String userId = userIdController.text;
                  final myUserId = await NativeStorage.get("user_id");
                  await post(
                      "/accept-friend-request",
                      jsonEncode({
                        "sender_id": userId,
                        "accepter_id": myUserId,
                      }));

                  final friendListJsonString =
                      await NativeStorage.get("friends");
                  final List<User> friendList =
                      User.listFromJson(friendListJsonString ?? "[]");

                  friendList.add(User(userId, usernameController.text, true));
                  await NativeStorage.store(
                      "friends", User.listToJson(friendList));
                  // now we need to show the home page
                  if (!context.mounted) return;
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HomePage(friends: friendList),
                    ),
                  );
                },
                child: const Text("Accept"),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
