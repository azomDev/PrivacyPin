import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum TileType { number, switcher }

class SettingTile extends StatefulWidget {
  final TileType tileType;
  final String title;
  final String description;
  final Future<dynamic> Function() getInitialValue;
  final Function(dynamic) onValueChanged;

  const SettingTile({
    required this.tileType,
    required this.title,
    required this.description,
    required this.getInitialValue,
    required this.onValueChanged,
  });

  @override
  State<SettingTile> createState() => _SettingTileState();
}

class _SettingTileState extends State<SettingTile> {
  late TextEditingController _textEditingController;

  @override
  void initState() {
    super.initState();
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
    return Expanded(
      //! Do I need Expanded?
      child: TextFormField(
        controller: _textEditingController,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        onEditingComplete: () {
          widget.onValueChanged(int.tryParse(_textEditingController.text));
          FocusScope.of(context).unfocus(); // To hide the keyboard apparently
        },
      ),
    );
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
