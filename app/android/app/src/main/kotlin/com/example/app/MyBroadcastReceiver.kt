package com.example.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class MyBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        Log.d("MyBroadcastReceiver", "Alarm received, starting worker thread!")

        val workerThread = MyWorkerThread(context!!)
        workerThread.start()
    }
}
