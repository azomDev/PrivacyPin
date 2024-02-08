import 'package:app/logic/database_api.dart';
import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import "package:flutter/material.dart";
import 'pages/home_page.dart';
import 'pages/signup_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SettingsAPI.initializeSettingsAPI();
  await SQLDatabase.initDatabase();
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  static final GlobalKey<State<MyApp>> appKey = GlobalKey<_MyAppState>();
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.system;
  late bool _isLoggedIn;

  @override
  void initState() {
    super.initState();
    _loadTheme();
    _isLoggedIn = SettingsAPI.getSetting<String>("user_id") != null;
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

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'PrivacyPin',
      theme: ThemeData(),
      darkTheme: ThemeData.dark(),
      themeMode: _themeMode,
      home: _isLoggedIn
          ? HomePage(
              changeAppTheme: (ThemeMode newThemeMode) {
                setState(() {
                  _themeMode = newThemeMode;
                });
              },
            )
          : SignupPage(callback: () {
              setState(() {
                _isLoggedIn = true;
              });
            }),
    );
  }
}
