package com.reelmonster.tracking

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.reelmonster.data.StatisticsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.Calendar

class UsageTracker(
    private val context: Context,
    private val repository: StatisticsRepository
) {
    private val scope = CoroutineScope(Dispatchers.IO)

    init {
        startPeriodicTracking()
    }

    private fun startPeriodicTracking() {
        scope.launch {
            while (isActive) {
                if (hasUsageStatsPermission(context)) {
                    val minutes = calculateTodayForegroundUsageMinutes()
                    repository.updateEstimatedUsage(minutes)
                }
                delay(60_000L) // Refresh every 1 minute
            }
        }
    }

    /**
     * Calculates foreground usage time for Instagram and YouTube between midnight and now.
     * Accurately parses UsageEvents to pair ACTIVITY_RESUMED and ACTIVITY_PAUSED.
     */
    fun calculateTodayForegroundUsageMinutes(): Long {
        if (!hasUsageStatsPermission(context)) return 0L

        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return 0L

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val events = usageStatsManager.queryEvents(startTime, endTime)
        var totalMillis = 0L

        val targetPackages = setOf("com.instagram.android", "com.google.android.youtube")
        val resumeTimestamps = mutableMapOf<String, Long>()

        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            val pkg = event.packageName ?: continue
            if (!targetPackages.contains(pkg)) continue

            when (event.eventType) {
                UsageEvents.Event.ACTIVITY_RESUMED -> {
                    resumeTimestamps[pkg] = event.timeStamp
                }
                UsageEvents.Event.ACTIVITY_PAUSED,
                UsageEvents.Event.ACTIVITY_STOPPED -> {
                    val resumed = resumeTimestamps.remove(pkg)
                    if (resumed != null && event.timeStamp > resumed) {
                        totalMillis += (event.timeStamp - resumed)
                    }
                }
            }
        }

        // Account for currently foregrounded activity
        val now = System.currentTimeMillis()
        for ((_, resumed) in resumeTimestamps) {
            if (now > resumed) {
                totalMillis += (now - resumed)
            }
        }

        return (totalMillis / (1000 * 60)).coerceAtLeast(0L)
    }

    companion object {
        fun hasUsageStatsPermission(context: Context): Boolean {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            }
            return mode == AppOpsManager.MODE_ALLOWED
        }

        fun createUsageSettingsIntent(): Intent {
            return Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        }
    }
}
