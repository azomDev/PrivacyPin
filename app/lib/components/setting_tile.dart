import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum TileType {
  number,
  switcher,
}

class SettingTile extends StatefulWidget {
  final String title;
  final String description;
  final String settingName;
  final Function initialValueFunction;
  final Function onEditingCompleteFunction;

  SettingTile({
    required this.title,
    required this.description,
    required this.settingName,
    required this.initialValueFunction,
    required this.onEditingCompleteFunction,
  });

  @override
  _SettingTileState createState() => _SettingTileState();
}

class _SettingTileState extends State<SettingTile> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValueFunction());
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(widget.title),
      subtitle: Text(widget.description),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
      trailing: SizedBox(
        width: 70.0,
        child: TextFormField(
          controller: _controller,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          onEditingComplete: widget.onEditingCompleteFunction(_controller.text),
        ),
      ),
    );
  }
}
