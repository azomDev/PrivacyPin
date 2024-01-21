package com.example.app

import android.util.Log
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import android.content.Context
import android.location.Location
import android.location.LocationManager
 
class MyWorkerThread(private val context: Context) : Thread() {

    override fun run() {
        // Your background work goes here
        Log.d("MyWorkerThread", "Alarm received, sending to server!")

        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val lastKnownLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)

        val latitude = String.format(Locale.ROOT, "%f", lastKnownLocation?.latitude)
        val longitude = String.format(Locale.ROOT, "%f", lastKnownLocation?.longitude)

        val timestamp = System.currentTimeMillis()

        val sharedPref = context.getSharedPreferences("com.example.app.preferences", Context.MODE_PRIVATE)
        val server_url = sharedPref.getString("server_url", "defaultValueidk")
        val user_id = sharedPref.getString("user_id", "defaultValueidk")

        val jsonString = """{"user_id": "$user_id", "longitude": "$longitude", "latitude": "$latitude", "timestamp": "$timestamp"}"""

        try {
            val url = "$server_url/send_ping"
            val urlObject = URL(url)
            val connection = urlObject.openConnection() as HttpURLConnection

            // Set the request method to POST
            connection.requestMethod = "POST"

            // Set the content type
            connection.setRequestProperty("Content-Type", "application/json")

            // Enable input/output streams
            connection.doOutput = true

            // Write data to the output stream
            val outputStream = OutputStreamWriter(connection.outputStream)
            outputStream.write(jsonString)
            outputStream.flush()

            // Get the response code
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                connection.disconnect()
                return
            }

            // Close the connection
            connection.disconnect()

        } catch (e: Exception) {
            // Handle exceptions
            e.printStackTrace()
        }
    }
}
