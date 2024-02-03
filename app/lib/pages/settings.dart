import "package:app/components/setting_tile.dart";
import "package:app/logic/settings_api.dart";
import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:shared_preferences/shared_preferences.dart";
import '/main.dart';

enum SettingName {
  themeMode,
  pingFrequency,
  // serverUrl,
  // userId,
}

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Settings'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Appearance'),
              Tab(text: 'Privacy'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Appearance Tab
            Column(
              children: <Widget>[
                SegmentedButton(
                  segments: const [
                    ButtonSegment(
                      icon: Icon(Icons.brightness_6),
                      value: ThemeMode.system,
                      label: Text("System"),
                    ),
                    ButtonSegment(
                      icon: Icon(Icons.light_mode),
                      value: ThemeMode.light,
                      label: Text("Light"),
                    ),
                    ButtonSegment(
                      icon: Icon(Icons.dark_mode),
                      value: ThemeMode.dark,
                      label: Text("Dark"),
                    ),
                  ],
                  selected: {
                    (() {
                      switch (SettingsAPI.getSetting(SettingName.themeMode.toString())) {
                        case 0:
                          return ThemeMode.system;
                        case 1:
                          return ThemeMode.light;
                        case 2:
                          return ThemeMode.dark;
                        default:
                          return ThemeMode.system;
                      }
                    })(),
                  },
                  onSelectionChanged: (value) {
                    MyApp.of(context).changeTheme(value.first);
                    int intValue = (value.first == ThemeMode.system) ? 0 : ((value.first == ThemeMode.light) ? 1 : 2);
                    SettingsAPI.setSetting<int>(SettingName.themeMode.toString(), intValue);
                    // setState(() {
                    //   _settings[SettingName.themeMode] = intValue;
                    // });
                  },
                ),
              ],
            ),

            // Privacy Tab
            Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // ListTile(
                //   title: const Text('Ping frequency'),
                //   subtitle: const Text('Adjust location update interval in minutes'),
                //   contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
                //   trailing: SizedBox(
                //     width: 70.0,
                //     child: TextFormField(
                //       textAlign: TextAlign.center,
                //       initialValue: _settings[SettingName.pingFrequency].toString(),
                //       keyboardType: TextInputType.number,
                //       inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                //       onChanged: (newValue) {
                //         _settings[SettingName.pingFrequency] = int.parse(newValue);
                //       },
                //       onEditingComplete: () {
                //         SettingsAPI.setSetting<int>(SettingName.themeMode.toString(), _settings[SettingName.pingFrequency], saveInKotlin: true);
                //       },
                //     ),
                //   ),
                // ),
                SettingTile(
                  title: "Ping frequency",
                  description: "Adjust location update interval in minutes",
                  settingName: SettingName.pingFrequency.toString(),
                  settingInKotlin: true,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
