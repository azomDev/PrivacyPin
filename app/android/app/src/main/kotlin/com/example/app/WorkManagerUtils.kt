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

            val periodicWorkRequest = PeriodicWorkRequest.Builder(LocationWorker::class.java, intervalMinutes, TimeUnit.MINUTES).build()

            workManager.enqueueUniquePeriodicWork(uniqueWorkName, ExistingPeriodicWorkPolicy.REPLACE, periodicWorkRequest)
        }
    }
}
