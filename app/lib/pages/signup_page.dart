import 'package:app/logic/http_api.dart';
import 'package:app/logic/settings_api.dart';
import 'package:app/main.dart';
import 'package:flutter/material.dart';

class SignupPage extends StatefulWidget {
  @override
  _SignupPageState createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final TextEditingController _serverUrlController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PrivacyPin Signup'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Enter Username',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            TextField(
              controller: _serverUrlController,
              decoration: const InputDecoration(
                labelText: 'Enter Server URL',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: () async {
                SettingsAPI.setSetting<String>("server_url", _serverUrlController.text, saveInKotlin: true);
                String userId = await ServerAPI.createAccount(_usernameController.text, _serverUrlController.text);
                SettingsAPI.setSetting<String>("user_id", userId, saveInKotlin: true);
                if (context.mounted) Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => MyApp()));
              },
              child: const Text('Signup'),
            ),
          ],
        ),
      ),
    );
  }
}
