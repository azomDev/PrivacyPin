import "dart:convert";

import "package:flutter/material.dart";
import "package:privacypin/home.dart";
import "package:privacypin/storing.dart";
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import "package:privacypin/server_api.dart";

import 'package:cryptography/cryptography.dart';

class AccountCreationScreen extends StatelessWidget {
  AccountCreationScreen({super.key});
  final TextEditingController _signupKeyController = TextEditingController();
  final TextEditingController _serverURLController = TextEditingController();

  void processAccountCreation(BuildContext context) async {
    final algorithm = Ed25519();
    final keyPair = await algorithm.newKeyPair();
    final privateKey = await keyPair.extractPrivateKeyBytes();
    final publicKey = (await keyPair.extractPublicKey()).bytes;

    final userId = await createAccount(
      _serverURLController.text,
      base64Encode(publicKey),
      _signupKeyController.text,
    );

    await NativeStorage.store("private_key", base64Encode(privateKey));
    await NativeStorage.store("public_key", base64Encode(publicKey));
    await NativeStorage.store("user_id", userId);
    await NativeStorage.store("server_url", _serverURLController.text);
    await NativeStorage.store("friends", "[]");

    // Navigate to HomePage
    if (!context.mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomePage(friends: [])),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("PrivacyPin")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Account Creation",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _signupKeyController,
              decoration: const InputDecoration(
                labelText: "Account Creation Key",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _serverURLController,
              decoration: const InputDecoration(
                labelText: "Server URL",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => processAccountCreation(context),
              child: const Text("Create Account"),
            ),
          ],
        ),
      ),
    );
  }
}
