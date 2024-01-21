import 'package:flutter/material.dart';
import '../logic/database_api.dart';
import '../logic/http_api.dart';
import '../logic/models.dart';
import 'friend_window.dart';
import 'person_list.dart';
import 'settings.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Person> _persons = [];

  @override
  void initState() {
    super.initState();
    _fetchPersonsFromDatabase();
  }

  Future<void> _fetchPersonsFromDatabase() async {
    List<Person> persons = await SQLDatabase.getAllFriends();
    setState(() {
      _persons = persons;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PrivacyPin'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () async {
              await refreshPersonsList();
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SettingsPage()),
              );
            },
          ),
        ],
      ),
      body: PersonsList(persons: _persons),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AddPopup();
            },
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Future<void> refreshPersonsList() async {
    await SQLDatabase.nukeDatabase();
    List<Person> persons = await ServerAPI.getAllUsers();
    for (Person person in persons) {
      await SQLDatabase.insertPerson(person);
    }
    _fetchPersonsFromDatabase();
  }
}
