import android.content.Context
import android.location.LocationManager
import android.util.Log
import androidx.work.ListenableWorker
import androidx.work.Worker
import androidx.work.WorkerParameters
import androidx.work.ListenableWorker.Result
import java.net.HttpURLConnection
import java.io.OutputStreamWriter
import java.net.URL
import java.util.Locale
import java.time.Duration
import java.util.concurrent.TimeUnit

class LocationWorker(appContext: Context, workerParams: WorkerParameters):
        Worker(appContext, workerParams) {
    override fun doWork(): Result {

        Log.d("MyWorkerThread", "Alarm received, sending to server!")

        val locationManager = applicationContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        // CancellationSignal cancellationSignal = new CancellationSignal();
        // Executor executor = Runnable.run();
        // val location = locationManager.getCurrentLocation(LocationManager.GPS_PROVIDER, cancellationSignal, executor, consumer);
        val location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)

        val latitude = String.format(Locale.ROOT, "%f", location?.latitude)
        val longitude = String.format(Locale.ROOT, "%f", location?.longitude)

        val timestamp = System.currentTimeMillis()

        val sharedPref = applicationContext.getSharedPreferences("com.example.app.preferences", Context.MODE_PRIVATE)
        val server_url = sharedPref.getString("SettingName.serverUrl", "defaultValueidk")
        val user_id = sharedPref.getString("SettingName.userId", "defaultValueidk")

        val jsonString = """{"user_id": "$user_id", "longitude": "$longitude", "latitude": "$latitude", "timestamp": "$timestamp"}"""

        try {
            val urlObject = URL("$server_url/send_ping")
            val connection = urlObject.openConnection() as HttpURLConnection

            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.doOutput = true

            val outputStream = OutputStreamWriter(connection.outputStream)
            outputStream.write(jsonString)
            outputStream.flush()

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                connection.disconnect()
                return Result.success()
            }

            connection.disconnect()

        } catch (e: Exception) {
            // Handle exceptions
            e.printStackTrace()
        }

        return Result.success()
    }
}
