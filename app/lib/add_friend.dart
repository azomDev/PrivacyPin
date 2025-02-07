// here, we want a page that will make the users follow a specific sequence of qr scan then qr code display or vice versa
// The page is called with a bool isFirst to determine if the user starts with a qr code or a qr scan

// to add friends:
// - popup of buttons "1st" and "2nd" that determine the order of who scans who first
// - for "1st", it is a qr code, for "2nd", it is a scanner
// - when the scan is done, "2nd" send a friend request to the server
// - for "1st", it is a scanner, for 2nd", it is a qr code
// - when the scan is done, "1st" sends a message to the server to accept the friend request. Meanwhile, "2nd" is fetching each second the status of the Link on the server.
// - Once the link has been created ("1st" got an ok response and "2nd" fetched a confirmation message) the screen shows a confirmation popup

// todo this entire file just a basic thing :P
import "package:flutter/material.dart";

class AddFriendPage extends StatelessWidget {
  final bool isFirst;

  const AddFriendPage({super.key, required this.isFirst});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Add Friend"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(isFirst ? "You are the 1st" : "You are the 2nd"),
            ElevatedButton(
              onPressed: () {
                // todo open qr code scanner
              },
              child: const Text("Scan QR Code"),
            ),
            ElevatedButton(
              onPressed: () {
                // todo open qr code generator
              },
              child: const Text("Generate QR Code"),
            ),
          ],
        ),
      ),
    );
  }
}
