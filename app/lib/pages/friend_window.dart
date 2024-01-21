import "package:flutter/material.dart";

class AddPopup extends StatefulWidget {
  @override
  _AddPopupState createState() => _AddPopupState();
}

class _AddPopupState extends State<AddPopup> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add person to track', textAlign: TextAlign.center),
      actions: <Widget>[
        Row(
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Temporary
                // Do something
              },
              child: const Text('Scan QR'),
            ),
            const SizedBox(width: 10), // Add some spacing between buttons
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Temporary
                // Do something
              },
              child: const Text('Generate QR'),
            ),
          ],
        ),
      ],
    );
  }
}
