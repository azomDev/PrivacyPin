// here we will have the settings with:
// - a toggle for the user to enable or disable the app (background location tracking)
// - changing theme (light, dark, system)
// - delete account button
// - set time between pings (background location tracking refresh rate)

// todo check this entire file to add coments and to finish it
import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  void _deleteAccount() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Delete Account"),
        content: Text(
            "Are you sure you want to delete your account? This action is irreversible."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              // Handle account deletion logic
              Navigator.pop(context);
            },
            child: Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Settings")),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          SwitchListTile(
            title: Text("Enable Location Tracking"),
            value: true,
            onChanged: (value) {
              setState(() {
                // todo
              });
            },
          ),
          ListTile(
            title: Text("Theme"),
            trailing: SegmentedButton(
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
                // todo
                return {ThemeMode.system};
              })(),
              onSelectionChanged: (value) {
                // todo change app theme
              },
            ),
          ),
          ListTile(
              // todo
              ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: _deleteAccount,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child:
                Text("Delete Account", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
