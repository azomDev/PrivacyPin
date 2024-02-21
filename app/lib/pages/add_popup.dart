import 'package:flutter/material.dart';

class AddPopup extends StatefulWidget {
  @override
  State<AddPopup> createState() => _AddPopupState();
}

class _AddPopupState extends State<AddPopup> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add a friend', textAlign: TextAlign.center),
      actions: <Widget>[
        Row(
          children: [
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text("Create QR not yet implemented"),
                ));
                Navigator.of(context).pop();
              },
              child: const Text('Create QR'),
            ),
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text("Scan QR not yet implemented"),
                ));
                Navigator.of(context).pop();
              },
              child: const Text('Scan QR'),
            ),
          ],
        ),
      ],
    );
  }
}
