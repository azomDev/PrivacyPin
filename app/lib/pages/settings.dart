import "package:app/apis/http_api.dart";
import "package:app/components/setting_tile.dart";
import "package:app/apis/settings_api.dart";
import "package:flutter/material.dart";

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
    return FutureBuilder<bool>(
      future: SettingsAPI.getSetting(SettingName.isAdmin),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
          bool is_admin = snapshot.data!;
          return DefaultTabController(
            length: is_admin ? 3 : 2,
            child: Scaffold(
              appBar: AppBar(
                title: const Text('Settings'),
                bottom: TabBar(
                  tabs: [
                    const Tab(text: 'Appearance'),
                    const Tab(text: 'Privacy'),
                    if (is_admin) const Tab(text: "Admin"),
                  ],
                ),
              ),
              body: TabBarView(
                children: [
                  // Appearance Tab
                  _buildAppearanceTab(widget.changeAppTheme),

                  // Privacy Tab
                  _buildPrivacyTab(),

                  // Admin Tab
                  if (is_admin) _buildAdminTab(),
                ],
              ),
            ),
          );
        } else {
          return const CircularProgressIndicator();
        }
      },
    );
  }
}

Widget _buildAppearanceTab(Function(ThemeMode) changeAppTheme) {
  return FutureBuilder<int>(
    future: SettingsAPI.getSetting(SettingName.themeMode),
    builder: (context, snapshot) {
      if (snapshot.connectionState == ConnectionState.waiting) {
        return const CircularProgressIndicator();
      } else if (snapshot.hasError) {
        // Handle error
        return Text('Error: ${snapshot.error}');
      } else {
        int initialValue = snapshot.data!;

        return Column(
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
                switch (initialValue) {
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
              onSelectionChanged: (value) async {
                changeAppTheme(value.first);
                int intValue = (value.first == ThemeMode.system) ? 0 : ((value.first == ThemeMode.light) ? 1 : 2);
                await SettingsAPI.setSetting(SettingName.themeMode, intValue);
              },
            ),
          ],
        );
      }
    },
  );
}

Widget _buildPrivacyTab() {
  return const Column(
    mainAxisSize: MainAxisSize.min,
    children: <Widget>[
      SettingTile(
        tile_type: TileType.number,
        title: "Ping frequency",
        description: "Adjust location update interval in minutes",
        setting: SettingName.pingFrequency,
      ),
      SettingTile(
        tile_type: TileType.switcher,
        title: "Switcher Placeholder",
        description: "Does nothing lol",
        setting: SettingName.tempSwitcher,
      ),
    ],
  );
}

Widget _buildAdminTab() {
  return Column(
    mainAxisAlignment: MainAxisAlignment.center,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      ElevatedButton(
        onPressed: () async {
          ServerAPI.generateRegistrationKey();
        },
        child: const Text('Generate Registration Key'),
      ),
      const SizedBox(height: 16),
      ElevatedButton(
        onPressed: () async {
          ServerAPI.clearRegistrationKeys();
        },
        child: const Text('Clear Registration Keys'),
      ),
    ],
  );
}
