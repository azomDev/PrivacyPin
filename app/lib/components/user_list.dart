import 'package:app/logic/crypto_utils.dart';
import 'package:app/logic/database_api.dart';
import 'package:app/logic/settings_api.dart';
import 'package:app/pages/settings.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../logic/http_api.dart';
import '../logic/models.dart';

class UsersList extends StatefulWidget {
  final List<User> users;

  const UsersList({
    required this.users,
  });

  @override
  State<UsersList> createState() => _UsersListState();
}

class _UsersListState extends State<UsersList> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.users.length,
      itemBuilder: (context, index) {
        final User user = widget.users[index];
        return ListTile(
          title: Text(user.username),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.person_pin_circle_outlined),
                onPressed: () async {
                  Ping ping = await ServerAPI.getPing(user.id);
                  String my_user_id = SettingsAPI.getSetting<String>(SettingName.userId.toString())!;
                  LocationKey location_key = await ServerAPI.getLocationKey(my_user_id, user.id);
                  String secret_key = SettingsAPI.getSetting<String>(user.id)!;
                  String ping_decryption_key = location_key.decrypt(secret_key);
                  Position position = ping.decrypt(ping_decryption_key);
                  openGoogleMaps(position);
                },
              ),
              IconButton(
                icon: Icon(user.am_i_sending ? Icons.visibility : Icons.visibility_off),
                onPressed: () async {
                  bool new_value = !user.am_i_sending;
                  String my_user_id = SettingsAPI.getSetting<String>(SettingName.userId.toString())!;
                  String location_decryption_key = CryptoUtils.generateLocationKey();
                  for (User user in widget.users) {
                    String secret_key = SettingsAPI.getSetting<String>(user.id)!;
                    String encrypted_location_key = CryptoUtils.encrypt(location_decryption_key, secret_key);
                    String signature = CryptoUtils.sign(encrypted_location_key);
                    SignedLocationKey signed_location_key = SignedLocationKey(my_user_id, user.id, encrypted_location_key, DateTime.now().toIso8601String(), signature);
                    await ServerAPI.updateLocationKey(signed_location_key);
                  }
                  SQLDatabase.modifyUser(user.id, new_value);
                  setState(() {
                    user.am_i_sending = new_value; //? will it actually update?
                  });
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

void openGoogleMaps(Position position) async {
  String mapsUrl = 'https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}';
  Uri uri = Uri.parse(mapsUrl);
  launchUrl(uri);
}
