import 'dart:typed_data';

import 'package:app/apis/settings_api.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

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
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => QrImageView(
                      data: "testtest",
                      version: QrVersions.auto,
                      size: 500.0,
                    ),
                  ),
                );
              },
              child: const Text('Create QR'),
            ),
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => QrScanScreen(),
                  ),
                );
              },
              child: const Text('Scan QR'),
            ),
          ],
        ),
      ],
    );
  }
}

class QrCodeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("QR Code"),
      ),
      body: FutureBuilder(
        future: _loadData(),
        builder: (BuildContext context, AsyncSnapshot<Map<String, String>> snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else {
            final data = snapshot.data!;
            return Center(
              child: QrImageView(
                data: "${data["user_id"]}~${data["username"]}~${data["secret_key"]}",
                version: QrVersions.auto,
                size: 500.0,
              ),
            );
          }
        },
      ),
    );
  }

  Future<Map<String, String>> _loadData() async {
    String user_id = await SettingsAPI.getSetting(SettingName.userId);
    String username = await SettingsAPI.getSetting(SettingName.username);
    String secret_key = await SettingsAPI.getUserSecretKey(user_id);

    return {
      "user_id": user_id,
      "username": username,
      "secret_key": secret_key,
    };
  }
}

// todo make it work lol
class QrScanScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MobileScanner(
      onDetect: (capture) {
        final List<Barcode> barcodes = capture.barcodes;
        final Uint8List? image = capture.image;
        for (final barcode in barcodes) {
          debugPrint('Barcode found! ${barcode.rawValue}');
        }
      },
    );
  }
}
