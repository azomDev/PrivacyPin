import 'package:app/apis/settings_api.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum TileType { number, switcher }

class SettingTile extends StatefulWidget {
  final TileType tile_type;
  final String title;
  final String description;
  final SettingName setting;

  const SettingTile({
    required this.tile_type,
    required this.title,
    required this.description,
    required this.setting,
  });

  @override
  State<SettingTile> createState() => _SettingTileState();
}

class _SettingTileState extends State<SettingTile> {
  late TextEditingController _text_editing_controller;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(widget.title),
      subtitle: Text(widget.description),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
      trailing: FutureBuilder<dynamic>(
        future: SettingsAPI.getSetting(widget.setting),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
            if (widget.tile_type == TileType.number) {
              _text_editing_controller = TextEditingController(text: snapshot.data.toString());
              return _buildNumberInput();
            } else {
              return _buildSwitch(snapshot.data);
            }
          } else {
            if (widget.tile_type == TileType.number) {
              _text_editing_controller = TextEditingController(text: "");
              return _buildNumberInput();
            } else {
              return _buildSwitch(false);
            }
          }
        },
      ),
    );
  }

  Widget _buildNumberInput() {
    return SizedBox(
        width: 70.0,
        child: TextFormField(
          controller: _text_editing_controller,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onEditingComplete: () async {
            await SettingsAPI.setSetting(widget.setting, int.parse(_text_editing_controller.text));
            if (!mounted) return;
            FocusScope.of(context).unfocus(); // To hide the keyboard apparently
          },
        ));
  }

  Widget _buildSwitch(bool switch_value) {
    return Switch(
      value: switch_value,
      onChanged: (bool new_value) async {
        setState(() {
          switch_value = !switch_value;
        });
        await SettingsAPI.setSetting(widget.setting, new_value);
      },
    );
  }

  @override
  void dispose() {
    if (widget.tile_type == TileType.number) {
      _text_editing_controller.dispose();
    }
    super.dispose();
  }
}
