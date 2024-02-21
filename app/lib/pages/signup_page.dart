import 'package:app/logic/crypto_utils.dart';
import 'package:app/logic/http_api.dart';
import 'package:app/logic/settings_api.dart';
import 'package:app/main.dart';
import 'package:app/pages/settings.dart';
import 'package:flutter/material.dart';

class SignupPage extends StatefulWidget {
  final ThemeMode initial_theme_mode;
  const SignupPage({required this.initial_theme_mode});
  @override
  State<SignupPage> createState() => _SignupPageState();
}

//! Do we need to use MaterialApp() since it is going to be runing with runApp()?

class _SignupPageState extends State<SignupPage> {
  final TextEditingController _username_controller = TextEditingController();
  final TextEditingController _server_url_controller = TextEditingController();
  final TextEditingController _registration_id_controller = TextEditingController();

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
                labelText: "Enter Username",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            TextField(
              controller: _server_url_controller,
              decoration: const InputDecoration(
                labelText: "Enter Server URL",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            TextField(
              controller: _registration_id_controller,
              decoration: const InputDecoration(
                labelText: "Enter Registration ID",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: () async {
                await SettingsAPI.setSetting<String>(SettingName.serverUrl.toString(), _server_url_controller.text, save_in_kotlin: true);
                String public_signing_key = CryptoUtils.generateSigningKeyPair();
                String user_id = await ServerAPI.createAccount(_registration_id_controller.text, public_signing_key);
                await SettingsAPI.setSetting<String>(SettingName.userId.toString(), user_id, save_in_kotlin: true);
                runApp(MyApp(initialThemeMode: widget.initial_theme_mode));
              },
              child: const Text('Signup'),
            ),
          ],
        ),
      ),
    );
  }
}
