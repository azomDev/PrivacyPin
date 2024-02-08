import 'package:app/logic/database_api.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../logic/http_api.dart';
import '../logic/models.dart';

class UsersList extends StatefulWidget {
  final List<Link> links;

  const UsersList({
    required this.links,
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
      itemCount: widget.links.length,
      itemBuilder: (context, index) {
        final Link link = widget.links[index];
        return UserListItem(link: link);
      },
    );
  }
}

class UserListItem extends StatefulWidget {
  final Link link;

  const UserListItem({
    required this.link,
  });

  @override
  State<UserListItem> createState() => _UserListItemState();
}

class _UserListItemState extends State<UserListItem> {
  late bool am_i_sending;

  @override
  void initState() {
    super.initState();
    am_i_sending = widget.link.am_i_sending == 1;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User>(
      future: SQLDatabase.getUser(widget.link.receiver_user_id),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const ListTile(
            title: Text('Loading...'),
          );
        } else if (snapshot.hasError) {
          return const ListTile(
            title: Text('Error loading user'),
          );
        } else {
          final User user = snapshot.data!;
          return ListTile(
            title: Text(user.username),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.person_pin_circle_outlined),
                  onPressed: () async {
                    Ping ping = await ServerAPI.getPing(user.id);
                    openGoogleMaps(ping.latitude, ping.longitude);
                  },
                ),
                IconButton(
                  icon: Icon(am_i_sending ? Icons.visibility : Icons.visibility_off),
                  onPressed: () async {
                    bool new_value = !am_i_sending;
                    await ServerAPI.modifyLink(user.id, new_value ? 1 : 0);
                    await SQLDatabase.modifyLink(widget.link.id, new_value ? 1 : 0);
                    setState(() {
                      am_i_sending = new_value;
                    });
                  },
                ),
              ],
            ),
          );
        }
      },
    );
  }
}

void openGoogleMaps(double latitude, double longitude) async {
  String mapsUrl = 'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';
  Uri uri = Uri.parse(mapsUrl);
  launchUrl(uri);
}
