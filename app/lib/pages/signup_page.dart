import 'package:app/logic/http_api.dart';
import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import 'package:flutter/material.dart';

class SignupPage extends StatefulWidget {
  final VoidCallback callback;

  const SignupPage({required this.callback});
  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final TextEditingController _server_url_controller = TextEditingController();
  final TextEditingController _username_controller = TextEditingController();

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
              controller: _username_controller,
              decoration: const InputDecoration(
                labelText: 'Enter Username',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            TextField(
              controller: _server_url_controller,
              decoration: const InputDecoration(
                labelText: 'Enter Server URL',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: () async {
                await SettingsAPI.setSetting<String>(SettingName.serverUrl.toString(), _server_url_controller.text, save_in_kotlin: true);
                String userId = await ServerAPI.createAccount(_username_controller.text);
                await SettingsAPI.setSetting<String>(SettingName.userId.toString(), userId, save_in_kotlin: true);
                widget.callback();
              },
              child: const Text('Signup'),
            ),
          ],
        ),
      ),
    );
  }
}
