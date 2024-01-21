package com.example.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.util.Log

object MyScheduler {
    private var pendingIntent: PendingIntent? = null
    private var alarmManager: AlarmManager? = null

    fun startRepeatingAlarm(context: Context, interval: Long) {
        Log.d("MY SCHEDULER", "Start repeating alarm called")
        alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, MyBroadcastReceiver::class.java)

        pendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val firstTriggerMillis = SystemClock.elapsedRealtime() + interval

        // Stop previous repeating alarm
        alarmManager?.cancel(pendingIntent)

        // Set up new repeating alarm
        alarmManager?.setRepeating(
            AlarmManager.ELAPSED_REALTIME_WAKEUP,
            firstTriggerMillis,
            interval,
            pendingIntent
        )
        Log.d("MY SCHEDULER", "Start repeating alarm done")
    }
}
