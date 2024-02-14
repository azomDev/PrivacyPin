import 'package:app/logic/database_api.dart';
import 'package:app/logic/http_api.dart';
import 'package:app/logic/models.dart';
import 'package:flutter/material.dart';

class FriendsPage extends StatefulWidget {
  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  List<User> _users = [];

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  void fetchUsers() async {
    List<User> users = await ServerAPI.getAllUsers();
    setState(() {
      _users = users;
    });
  }

  void addFriend(User user) async {
    await ServerAPI.createLink(user.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Friends Page'),
      ),
      body: ListView.builder(
        itemCount: _users.length,
        itemBuilder: (context, index) {
          final user = _users[index];
          return ListTile(
            title: Text(user.username),
            trailing: IconButton(
              icon: const Icon(Icons.person_add),
              onPressed: () {
                addFriend(user);
              },
            ),
          );
        },
      ),
    );
  }
}
