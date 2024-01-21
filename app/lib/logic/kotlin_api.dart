import "package:flutter/services.dart";

class KotlinAPI {
  static setSharedPreference(Map<String, String> data) async {
    const platform = MethodChannel("com.example.app/my_channel");
    try {
      final String result = await platform.invokeMethod("changeSetting", data);
      print(result);
    } on PlatformException catch (e) {
      print("Failed to send data to Kotlin: ${e.message}");
    }
  }

  static String _mapToString(Map<String, dynamic> inputMap) {
    List<String> keyValuePairs = inputMap.entries.map((entry) {
      return '"${entry.key}": "${entry.value}"';
    }).toList();

    return '{${keyValuePairs.join(', ')}}';
  }
}
