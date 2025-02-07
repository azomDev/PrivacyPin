import "package:flutter/material.dart";
import "package:privacypin/add_friend.dart";
import "package:privacypin/settings.dart";
import "package:privacypin/utils.dart";

class HomePage extends StatelessWidget {
  final List<User> friends;
  const HomePage({super.key, required this.friends});

  Future<List<Ping>> getPings(User user) async {
    // todo fetch pings from server
    final pings = <Ping>[
      Ping(37.7749, -122.4194, 1634025600),
      Ping(37.7749, -122.4194, 1634025600),
      Ping(37.7749, -122.4194, 1634025600),
    ];
    return pings;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("PrivacyPin"),
        actions: [
          // + Button
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: Text("Add Friend"),
                    content:
                        Text("Do you want to scan a QR code or generate one?"),
                    actions: [
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context); // Close the dialog
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  AddFriendPage(isFirst: true),
                            ),
                          );
                        },
                        child: Text("Generate QR"),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context); // Close the dialog
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  AddFriendPage(isFirst: false),
                            ),
                          );
                        },
                        child: Text("Scan QR"),
                      ),
                    ],
                  );
                },
              );
            },
          ),
          // Settings Button
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
      body: ListView.builder(
        itemCount: friends.length,
        itemBuilder: (context, index) {
          final person = friends[index];
          return ListTile(
            title: Text(person.username),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // GPS pin icon
                IconButton(
                  icon: const Icon(Icons.pin_drop),
                  onPressed: () async {
                    final pings = await getPings(person);
                    // todo open external map to show first ping in list so with pings[0]
                  },
                ),
                // Visibility toggle icon
                IconButton(
                    icon: Icon(person.amISending
                        ? Icons.visibility_off
                        : Icons.visibility),
                    onPressed: () {
                      // todo toggle visibilty by updating the User object where it is stored (it's the native code that will read it as well as here to display the correct icon)
                    }),
              ],
            ),
          );
        },
      ),
    );
  }
}
