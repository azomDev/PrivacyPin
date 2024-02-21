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
  List<User> _users = [];

  @override
  void initState() {
    super.initState();
    _fetchUsersFromDatabase();
  }

  Future<void> _fetchUsersFromDatabase() async {
    List<User> users = await SQLDatabase.getUsers();
    setState(() {
      _users = users;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PrivacyPin'),
        actions: [
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
      body: UsersList(users: _users),
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
}
