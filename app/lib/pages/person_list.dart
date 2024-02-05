import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../logic/http_api.dart';
import '../logic/models.dart';

class PersonsList extends StatefulWidget {
  final List<Person> persons;

  const PersonsList({
    required this.persons,
  });

  @override
  State<PersonsList> createState() => _PersonsListState();
}

class _PersonsListState extends State<PersonsList> {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.persons.length,
      itemBuilder: (context, index) {
        final person = widget.persons[index];
        return ListTile(
          title: Text(person.username),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.person_pin_circle_outlined),
                onPressed: () async {
                  // Assuming you have the appropriate methods in your ServerAPI
                  Ping ping = await ServerAPI.getPing(person.id);
                  openGoogleMaps(ping.latitude, ping.longitude);
                },
              ),
              // Additional IconButton widgets as needed
            ],
          ),
        );
      },
    );
  }
}

void openGoogleMaps(double latitude, double longitude) async {
  String mapsUrl = 'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';
  Uri uri = Uri.parse(mapsUrl);
  launchUrl(uri);
}
