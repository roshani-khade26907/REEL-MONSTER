package com.reelmonster

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.reelmonster.data.LocalDatabase
import com.reelmonster.data.MonsterPreferences
import com.reelmonster.data.StatisticsRepository
import com.reelmonster.tracking.UsageTracker

/**
 * Main Application class for Reel Monster.
 * Initializes the zero-cloud Room database, local preferences, and notification channels.
 */
class ReelMonsterApp : Application() {

    lateinit var database: LocalDatabase
        private set

    lateinit var repository: StatisticsRepository
        private set

    lateinit var preferences: MonsterPreferences
        private set

    lateinit var usageTracker: UsageTracker
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize local persistence
        database = LocalDatabase.getInstance(this)
        preferences = MonsterPreferences(this)
        repository = StatisticsRepository.getInstance(database.dailyStatsDao(), database.eventLogDao(), preferences)
        usageTracker = UsageTracker(this, repository)

        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                OVERLAY_CHANNEL_ID,
                getString(R.string.overlay_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.overlay_channel_desc)
                setShowBadge(false)
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }

    companion object {
        const val OVERLAY_CHANNEL_ID = "reel_monster_overlay_channel"
        lateinit var instance: ReelMonsterApp
            private set
    }
}
