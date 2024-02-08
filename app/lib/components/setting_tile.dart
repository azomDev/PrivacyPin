import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum TileType { number, switcher }

class SettingTile<T> extends StatefulWidget {
  final TileType tile_type;
  final String title;
  final String description;
  final SettingName setting_name;
  final T default_value;

  const SettingTile({
    required this.tile_type,
    required this.title,
    required this.description,
    required this.setting_name,
    required this.default_value,
  });

  @override
  State<SettingTile<T>> createState() => _SettingTileState<T>();
}

class _SettingTileState<T> extends State<SettingTile<T>> {
  late TextEditingController _text_editing_controller;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(widget.title),
      subtitle: Text(widget.description),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
      trailing: FutureBuilder<dynamic>(
        future: SettingsAPI.getSettingOrSetDefault(widget.setting_name.toString(), widget.default_value),
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
          onEditingComplete: () {
            SettingsAPI.setSetting<int>(widget.setting_name.toString(), int.parse(_text_editing_controller.text));
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
        await SettingsAPI.setSetting<bool>(widget.setting_name.toString(), new_value);
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
