import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum TileType { number, switcher }

class SettingTile<T> extends StatefulWidget {
  final TileType tileType;
  final String title;
  final String description;
  final Future<T> Function() getInitialValue;
  final Function(T) onValueChanged;

  const SettingTile({
    required this.tileType,
    required this.title,
    required this.description,
    required this.getInitialValue,
    required this.onValueChanged,
  });

  @override
  State<SettingTile<T>> createState() => _SettingTileState<T>();
}

class _SettingTileState<T> extends State<SettingTile<T>> {
  late TextEditingController _textEditingController;

  @override
  void initState() async {
    super.initState();
    var a = await widget.getInitialValue();
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(widget.title),
      subtitle: Text(widget.description),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
      trailing: FutureBuilder<dynamic>(
        future: widget.getInitialValue(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done && snapshot.hasData) {
            if (widget.tileType == TileType.number) {
              _textEditingController = TextEditingController(text: snapshot.data.toString());
              return _buildNumberInput();
            } else {
              return _buildSwitch(snapshot.data);
            }
          } else {
            if (widget.tileType == TileType.number) {
              _textEditingController = TextEditingController(text: "");
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
          controller: _textEditingController,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onEditingComplete: () {
            SettingsAPI.setSetting<T>(SettingName.pingFrequency.toString(), widget.hello);
            FocusScope.of(context).unfocus(); // To hide the keyboard apparently
          },
        ));
  }

  Widget _buildSwitch(bool switchValue) {
    return Switch(
      value: switchValue,
      onChanged: (bool newValue) {
        setState(() {
          // Your logic here
          widget.onValueChanged(newValue);
        });
      },
    );
  }

  @override
  void dispose() {
    if (widget.tileType == TileType.number) {
      _textEditingController.dispose();
    }
    super.dispose();
  }
}
