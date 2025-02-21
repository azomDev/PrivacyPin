import 'dart:convert';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';
import 'package:privacypin/storing.dart';

import 'package:http/http.dart' as http;

Future<String> post(String endpoint, String jsonBody) async {
  final serverUrl = await NativeStorage.get("server_url");

  final userId = await NativeStorage.get("user_id");

  final challengeResponse = await http.post(
    Uri.parse(serverUrl + "/challenge"),
    body: userId,
  );

  if (challengeResponse.statusCode != 200) {
    throw Exception('Failed to challenge');
  }

  final base64PrivateKey = await NativeStorage.get("private_key");
  final base64PublicKey = await NativeStorage.get("public_key");
  final privateKeyBytes = base64Decode(base64PrivateKey);
  final publicKeyBytes = base64Decode(base64PublicKey);

  final keyPair = SimpleKeyPairData(
    privateKeyBytes,
    publicKey: SimplePublicKey(publicKeyBytes, type: KeyPairType.ed25519),
    type: KeyPairType.ed25519,
  );

  Signature signature = await Ed25519().signString(
    jsonBody + challengeResponse.body,
    keyPair: keyPair,
  );

  final response = await http.post(
    Uri.parse(serverUrl + endpoint),
    body: jsonBody,
    headers: {
      "sign-data": jsonEncode(
          {"signature": base64Encode(signature.bytes), "user_id": userId}),
    },
  );

  return response.body;
}

// only api that returns a Result for MVP since there is user entered data involved
Future<String> createAccount(
    String serverUrl, String publicKey, String signupKey) async {
  final response = await http.post(
    Uri.parse(serverUrl + "/create-account"),
    body: jsonEncode({
      "pub_sign_key": publicKey,
      "signup_key": signupKey,
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Failed to create account');
  }

  return response.body;
}

Future<void> dummySendPing(String friendId) async {
  final myUserId = await NativeStorage.get("user_id");

  await post(
      "send-ping",
      jsonEncode({
        "sender_id": myUserId,
        "receiver_id": friendId,
        "encrypted_ping": jsonEncode({
          "latitude": 0.0,
          "longitude": 0.0,
          "timestamp": DateTime.now().millisecondsSinceEpoch,
        }),
      }));
}
