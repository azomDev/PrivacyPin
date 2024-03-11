package com.example.app

import android.os.Bundle
import android.os.StrictMode
import android.util.Log
import io.flutter.embedding.android.FlutterActivity
import android.content.Context
import android.content.SharedPreferences
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    private val CHANNEL = "com.example.app/my_channel"

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d("MAIN ACTIVITY", "Main activity starting")

        super.onCreate(savedInstanceState);

        // Register the platform channel

        MethodChannel(flutterEngine!!.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result: MethodChannel.Result ->
                if (call.method == "changePingInterval") {
                    val data = call.arguments as Map<String, Int>;
                    val interval = data["pingFrequency"]!!.toLong();
                    Log.d("MainActivity", "Received data from Flutter: $interval");
                    WorkManagerUtil.manageLocationWork(context, interval);

                    val sharedPref = context.getSharedPreferences("com.example.app.preferences", Context.MODE_PRIVATE);
                    val editor = sharedPref.edit();
                    editor.putLong("pingFrequency", interval);
                    editor.apply();
                    result.success("Data received successfully");
                }
                else if (call.method == "generateSigningKeyPair") {
                    val jsonString = """{"private": "testPrivateKey", "public": "testPublicKey"}"""
                    result.success(jsonString);
                }
                else if (call.method == "sign") {
                    //val data = call.arguments as Map<String, String>;
                    //val data_to_sign = data["data"]!!.toString();
                    result.success("test");
                }
                else if (call.method == "decrypt") {
                    //val data = call.arguments as Map<String, String>;
                    //val encrypted_data = data["encrypted_data"]!!.toString();
                    //val secret_key = data["secret_key"]!!.toString();
                    result.success("testDecryptMessage");
                }
                else if (call.method == "generateSecretKey") {
                    result.success("testSecretKey");
                }
                else if (call.method == "changeSetting"){ // todo if the setting is the ping interval, do something more
                // todo also the input could be not only String but also int, double, String and bool
                    val data = call.arguments as Map<String, String>;
                    val sharedPref = context.getSharedPreferences("com.example.app.preferences", Context.MODE_PRIVATE);
                    val editor = sharedPref.edit();
                    editor.putString(data["key"]!!, data["value"]!!.toString());
                    editor.apply();
                    result.success("yay");
                }
                else {
                    result.notImplemented();
                }
            }

            Log.d("MAIN ACTIVITY", "Main activity almost done");
            WorkManagerUtil.manageLocationWork(context, 15);
    }
}
