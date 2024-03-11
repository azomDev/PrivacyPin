import 'package:app/apis/crypto_utils.dart';
import 'package:app/apis/http_api.dart';
import 'package:app/apis/settings_api.dart';
import 'package:app/main.dart';
import 'package:flutter/material.dart';

class SignupPage extends StatefulWidget {
  final ThemeMode initial_theme_mode;
  const SignupPage({required this.initial_theme_mode});
  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final TextEditingController _username_controller = TextEditingController();
  final TextEditingController _server_url_controller = TextEditingController();
  final TextEditingController _registration_id_controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'PrivacyPin',
        theme: ThemeData(),
        darkTheme: ThemeData.dark(),
        themeMode: widget.initial_theme_mode,
        home: Scaffold(
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
                    if (_username_controller.text.contains('~')) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text("username can't have symbol '~' in it"),
                      ));
                      return;
                    }

                    await SettingsAPI.setSetting(SettingName.username, _username_controller.text);
                    await SettingsAPI.setSetting(SettingName.serverUrl, _server_url_controller.text);
                    String public_signing_key = await CryptoUtils.generateSigningKeyPair();
                    Map<String, dynamic> map = await ServerAPI.createAccount(_registration_id_controller.text, public_signing_key);
                    String user_id = map["user_id"];
                    await SettingsAPI.setSetting(SettingName.isAdmin, map["is_admin"]);
                    await SettingsAPI.setUserSecretKey(user_id, await CryptoUtils.generateSecretKey());
                    await SettingsAPI.setSetting(SettingName.userId, user_id);
                    runApp(MyApp(initialThemeMode: widget.initial_theme_mode));
                  },
                  child: const Text('Signup'),
                ),
              ],
            ),
          ),
        ));
  }
}
