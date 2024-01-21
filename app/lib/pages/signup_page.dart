import 'package:app/logic/http_api.dart';
import 'package:app/logic/setting_api.dart';
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
                SettingAPI.saveSetting<String>(true, "server_url", _serverUrlController.text);
                String userId = await ServerAPI.createAccount(_usernameController.text, _serverUrlController.text);
                SettingAPI.saveSetting<String>(true, "user_id", userId);
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
