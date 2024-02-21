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

  int themeValue = await SettingsAPI.getSettingOrSetDefault<int>(SettingName.themeMode.toString(), 0);
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

  bool is_logged_in = SettingsAPI.getSetting<String>("user_id") != null;
  if (is_logged_in) {
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
