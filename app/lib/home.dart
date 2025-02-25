import "dart:convert";
import "package:flutter/material.dart";
import "package:privacypin/add_friend.dart";
import "package:privacypin/server_api.dart";
import "package:privacypin/temp_dead/settings.dart";
import "package:privacypin/storing.dart";
import "package:privacypin/utils.dart";
import 'package:url_launcher/url_launcher.dart';

Future<void> openGoogleMaps(double latitude, double longitude) async {
  String mapsUrl = "geo:0,0?q=$latitude,$longitude";

  launchUrl(Uri.parse(mapsUrl));
}

class HomePage extends StatelessWidget {
  final List<User> friends;
  const HomePage({super.key, required this.friends});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("PrivacyPin"),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SettingsPage()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: friends.length,
              itemBuilder: (context, index) {
                final person = friends[index];
                return ListTile(
                  title: Text(person.username),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.pin_drop),
                        onPressed: () async {
                          final myUserId =
                              (await NativeStorage.get("user_id"))!;
                          final pingsAsStr = await post(
                              "/get-pings",
                              jsonEncode({
                                "sender_id": person.id,
                                "receiver_id": myUserId
                              }));
                          List<Ping> pings = Ping.listFromJson(pingsAsStr);
                          if (pings.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("No pings from this user"),
                              ),
                            );
                            return;
                          }
                          print(pings[0].latitude);
                          print(pings[0].longitude);
                          openGoogleMaps(pings[0].latitude, pings[0].longitude);
                        },
                      ),
                      IconButton(
                        icon: Icon(person.amISending
                            ? Icons.visibility_off
                            : Icons.visibility),
                        onPressed: () {
                          dummySendPing(person.id);
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const AddFriendWidget(),
        ],
      ),
    );
  }
}
