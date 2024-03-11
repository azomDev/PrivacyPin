import 'package:app/apis/database_api.dart';
import 'package:app/apis/kotlin_api.dart';
import 'package:app/apis/settings_api.dart';
import "package:flutter/material.dart";
import 'pages/home_page.dart';
import 'pages/signup_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SettingsAPI.initializeSettingsAPI();
  await SQLDatabase.initDatabase();
  KotlinAPI.initialize();

  int themeValue = await SettingsAPI.getSetting(SettingName.themeMode);
  ThemeMode themeMode;
  switch (themeValue) {
    case 0:
      themeMode = ThemeMode.system;
      break;
    case 1:
      themeMode = ThemeMode.light;
      break;
    case 2:
      themeMode = ThemeMode.dark;
      break;
    default:
      themeMode = ThemeMode.system;
  }

  if (await SettingsAPI.isLoggedIn()) {
    runApp(MyApp(initialThemeMode: themeMode));
  } else {
    runApp(SignupPage(initial_theme_mode: themeMode));
  }
}

class MyApp extends StatefulWidget {
  final ThemeMode initialThemeMode;
  const MyApp({required this.initialThemeMode});
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late ThemeMode _themeMode;

  @override
  void initState() {
    super.initState();
    _themeMode = widget.initialThemeMode;
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'PrivacyPin',
        theme: ThemeData(),
        darkTheme: ThemeData.dark(),
        themeMode: _themeMode,
        home: HomePage(
          changeAppTheme: (ThemeMode newThemeMode) {
            setState(() {
              _themeMode = newThemeMode;
            });
          },
        ));
  }
}
