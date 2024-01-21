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

        val policy = StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);

        // Register the platform channel

        MethodChannel(flutterEngine!!.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result: MethodChannel.Result ->
                if (call.method == "changePingInterval") {
                    val data = call.arguments as Map<String, Int>;
                    val interval = data["pingFrequency"]!!.toLong();
                    Log.d("MainActivity", "Received data from Flutter: $interval");
                    MyScheduler.startRepeatingAlarm(context, interval);
                    // TODO put it in a shared preference, after version 0.1
                    result.success("Data received successfully");
                }
                else if (call.method == "changeSetting"){
                    val data = call.arguments as Map<String, String>;
                        val sharedPref = context.getSharedPreferences("com.example.app.preferences", Context.MODE_PRIVATE)
                        val editor = sharedPref.edit()
                        editor.putString(data["key"], data["value"])
                        editor.apply()
                }
                else {
                    result.notImplemented()
                }
            }

            Log.d("MAIN ACTIVITY", "Main activity almost done")
            MyScheduler.startRepeatingAlarm(context, 1000);
    }
}
