import "package:app/components/setting_tile.dart";
import "package:app/logic/settings_api.dart";
import "package:flutter/material.dart";

enum SettingName {
  themeMode,
  pingFrequency,
  serverUrl,
  userId,
}

class SettingsPage extends StatefulWidget {
  final Function(ThemeMode) changeAppTheme;
  const SettingsPage({required this.changeAppTheme});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
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
                  selected: (() {
                    switch (SettingsAPI.getSetting<int>(SettingName.themeMode.toString())) {
                      case 0:
                        return {ThemeMode.system};
                      case 1:
                        return {ThemeMode.light};
                      case 2:
                        return {ThemeMode.dark};
                      default:
                        return {ThemeMode.system};
                    }
                  })(),
                  onSelectionChanged: (value) {
                    widget.changeAppTheme(value.first);
                    int intValue = (value.first == ThemeMode.system) ? 0 : ((value.first == ThemeMode.light) ? 1 : 2);
                    SettingsAPI.setSetting<int>(SettingName.themeMode.toString(), intValue);
                  },
                ),
              ],
            ),

            // Privacy Tab
            Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                SettingTile<int>(
                  tileType: TileType.number,
                  title: "Ping frequency",
                  description: "Adjust location update interval in minutes",
                  getInitialValue: () => SettingsAPI.getSettingOrSetDefault<int>(SettingName.pingFrequency.toString(), 15),
                  onValueChanged: (newValue) => SettingsAPI.setSetting<int>(SettingName.pingFrequency.toString(), newValue),
                ),
                SettingTile<bool>(
                  tileType: TileType.switcher,
                  title: "Ping frequency",
                  description: "Adjust location update interval in minutes",
                  getInitialValue: () => SettingsAPI.getSettingOrSetDefault<bool>("temp", true),
                  onValueChanged: (newValue) => SettingsAPI.setSetting<bool>("temp", newValue),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
