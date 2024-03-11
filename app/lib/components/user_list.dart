import 'package:app/apis/database_api.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../apis/http_api.dart';
import 'models.dart';

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
                  Position position = await ping.decrypt();
                  openGoogleMaps(position);
                },
              ),
              IconButton(
                icon: Icon(user.am_i_sending ? Icons.visibility : Icons.visibility_off),
                onPressed: () async {
                  bool new_value = !user.am_i_sending;
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
