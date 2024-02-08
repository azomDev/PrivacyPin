import "package:app/pages/add_links.dart";
import "package:flutter/material.dart";

class AddPopup extends StatefulWidget {
  @override
  State<AddPopup> createState() => _AddPopupState();
}

class _AddPopupState extends State<AddPopup> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add user to track', textAlign: TextAlign.center),
      actions: <Widget>[
        Row(
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FriendsPage()),
                );
              },
              child: const Text('Add online'),
            ),
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text("QR not yet implemented"),
                ));
                Navigator.of(context).pop();
              },
              child: const Text('Add with QR'),
            ),
          ],
        ),
      ],
    );
  }
}
