import 'package:app/logic/preferences_api.dart';
import "package:flutter/material.dart";
import 'pages/home_page.dart';
import 'pages/signup_page.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();

  static _MyAppState of(BuildContext context) => context.findAncestorStateOfType<_MyAppState>()!;
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.system;
  late Future<bool> _isLoggedInFuture;

  @override
  void initState() {
    super.initState();
    _isLoggedInFuture = _checkLoginStatus();
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    int? value = await SharedPreferencesAPI.getPreference<int>("SettingName.themeMode");

    if (value != null) {
      ThemeMode temp = ThemeMode.system;
      switch (value) {
        case 1:
          temp = ThemeMode.light;
          break;
        case 2:
          temp = ThemeMode.dark;
          break;
      }
      setState(() {
        _themeMode = temp;
      });
    }
  }

  Future<bool> _checkLoginStatus() async {
    String? userId = await SharedPreferencesAPI.getPreference<String>("user_id");
    print(userId);

    return userId != null;
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
            // If still waiting for the result, display a loading indicator or some other widget
            return const CircularProgressIndicator(); // Replace with your loading widget
          } else if (snapshot.data == true) {
            return HomePage();
          } else {
            return SignupPage();
          }
        },
      ),
    );
  }

  void changeTheme(ThemeMode themeMode) {
    setState(() {
      _themeMode = themeMode;
    });
  }

  ThemeMode getTheme() {
    return _themeMode;
  }
}
