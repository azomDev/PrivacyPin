import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import "package:flutter/material.dart";
import 'pages/home_page.dart';
import 'pages/signup_page.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();

  static _MyAppState of(BuildContext context) => context.findAncestorStateOfType<_MyAppState>()!;
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.system;
  late Future<bool> _isLoggedInFuture;

  @override
  void initState() {
    super.initState();
    SettingsAPI.initializeSettingsAPI();
    _loadTheme();
    _isLoggedInFuture = _checkLoginStatus();
  }

  void _loadTheme() async {
    int themeValue = await SettingsAPI.getSettingOrSetDefault<int>(SettingName.themeMode.toString(), 0);
    setState(() {
      switch (themeValue) {
        case 0:
          _themeMode = ThemeMode.system;
        case 1:
          _themeMode = ThemeMode.light;
        case 2:
          _themeMode = ThemeMode.dark;
      }
    });
  }

  Future<bool> _checkLoginStatus() async {
    return SettingsAPI.getSetting<String>("user_id") != null;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'PrivacyPin',
      theme: ThemeData(),
      darkTheme: ThemeData.dark(),
      themeMode: _themeMode,
      home: FutureBuilder<bool>(
        future: _isLoggedInFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CircularProgressIndicator();
          } else if (snapshot.data == true) {
            return HomePage();
          } else {
            return SignupPage(callback: () {
              setState(() {
                _isLoggedInFuture = Future.value(true);
              });
            });
          }
        },
      ),
    );
  }

  void changeTheme(ThemeMode newThemeMode) {
    setState(() {
      _themeMode = newThemeMode;
    });
  }
}
