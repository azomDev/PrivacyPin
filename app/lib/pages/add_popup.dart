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
                Navigator.of(context).pop(); // Temporary
                // Do something
              },
              child: const Text('Add online'),
            ),
            const SizedBox(width: 10), // Add some spacing between buttons
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text("QR not yet implemented"),
                ));
              },
              child: const Text('Add with QR'),
            ),
          ],
        ),
      ],
    );
  }
}
