import 'package:flutter/material.dart';
import '../logic/database_api.dart';
import '../logic/http_api.dart';
import '../logic/models.dart';
import 'add_popup.dart';
import '../components/user_list.dart';
import 'settings.dart';

class HomePage extends StatefulWidget {
  final Function(ThemeMode) changeAppTheme;

  const HomePage({required this.changeAppTheme});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Link> _links = [];

  @override
  void initState() {
    super.initState();
    _fetchLinksFromDatabase();
  }

  Future<void> _fetchLinksFromDatabase() async {
    List<Link> links = await SQLDatabase.getLinks();
    setState(() {
      _links = links;
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
              await refreshUsersAndLinks();
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SettingsPage(changeAppTheme: widget.changeAppTheme)),
              );
            },
          ),
        ],
      ),
      body: UsersList(links: _links),
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

  Future<void> refreshUsersAndLinks() async {
    await SQLDatabase.nukeUsersTable();
    await SQLDatabase.nukeLinksTable();
    List<User> users = await ServerAPI.getAllUsers();
    List<Link> links = await ServerAPI.getLinks();
    await SQLDatabase.insertUsers(users);
    await SQLDatabase.insertLinks(links);
    _fetchLinksFromDatabase();
  }
}
