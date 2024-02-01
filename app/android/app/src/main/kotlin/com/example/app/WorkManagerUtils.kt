import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequest
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit
import androidx.work.Constraints
import androidx.work.NetworkType

class WorkManagerUtil {

    companion object {

        fun manageLocationWork(context: Context, intervalMinutes: Long) {
            val workManager = WorkManager.getInstance(context)

            val uniqueWorkName = "LocationSharingWork"

            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED) 
                .build()

            // Define your periodic work request including constraints
            val periodicWorkRequest = PeriodicWorkRequest.Builder(LocationWorker::class.java, intervalMinutes, TimeUnit.MINUTES)
                    .setConstraints(constraints)
                    .build()

            workManager.enqueueUniquePeriodicWork(uniqueWorkName, ExistingPeriodicWorkPolicy.REPLACE, periodicWorkRequest)
        }
    }
}
