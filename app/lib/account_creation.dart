import "package:flutter/material.dart";
import "package:privacypin/home.dart";

class AccountCreationScreen extends StatelessWidget {
  AccountCreationScreen({super.key});
  final TextEditingController _keyController = TextEditingController();
  final TextEditingController _serverController = TextEditingController();

  void processAccountCreation(BuildContext context) async {
    // todo process account creation:
    // generate a keypair securely
    // send the public key and the account creation key to the server at the given URL
    // if the server responds with a success message, store the private key securely? (Or is it generated directly in the secure enclave?)
    // if the server responds with an error message, show an error dialog and allow the user to retry (how?)
    //
    // if the server responds with a sucess message, it will return the user id which needs to be stored

    // Navigate to HomePage
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomePage(friends: [])),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("PrivacyPin")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Account Creation",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _keyController,
              decoration: const InputDecoration(
                labelText: "Account Creation Key",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _serverController,
              decoration: const InputDecoration(
                labelText: "Server URL",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => processAccountCreation(context),
              child: const Text("Create Account"),
            ),
          ],
        ),
      ),
    );
  }
}
