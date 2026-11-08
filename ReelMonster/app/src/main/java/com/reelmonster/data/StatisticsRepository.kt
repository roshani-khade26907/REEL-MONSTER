package com.reelmonster.data

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.text.SimpleDateFormat
import java.util.*

class StatisticsRepository private constructor(
    private val statsDao: DailyStatsDao,
    private val logDao: EventLogDao,
    val preferences: MonsterPreferences
) {
    private val scope = CoroutineScope(Dispatchers.IO)
    private val mutex = Mutex()
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    // Cache the current today's date
    private fun getTodayDateString(): String = dateFormat.format(Date())

    val todayStatsFlow: Flow<DailyStats> = flow {
        val today = getTodayDateString()
        statsDao.observeStatsForDate(today).collect { stats ->
            emit(stats ?: DailyStats(dateString = today))
        }
    }.flowOn(Dispatchers.IO)

    val lastSevenDaysFlow: Flow<List<DailyStats>> = statsDao.observeLastSevenDays()
    val lifetimeReelsFlow: Flow<Int> = statsDao.observeLifetimeReels().map { it ?: 0 }

    suspend fun incrementReelCount(
        source: String = "MANUAL_TAP",
        targetApp: String = "manual" // "com.instagram.android" or "com.google.android.youtube"
    ): Int = mutex.withLock {
        val today = getTodayDateString()
        val current = statsDao.getStatsForDate(today) ?: DailyStats(dateString = today)

        val isInstagram = targetApp.contains("instagram", ignoreCase = true)
        val isYoutube = targetApp.contains("youtube", ignoreCase = true)
        val isAuto = source == "AUTO_DETECTED"

        val updated = current.copy(
            totalReels = current.totalReels + 1,
            instagramCount = if (isInstagram) current.instagramCount + 1 else current.instagramCount,
            youtubeShortsCount = if (isYoutube) current.youtubeShortsCount + 1 else current.youtubeShortsCount,
            manualIncrements = if (!isAuto) current.manualIncrements + 1 else current.manualIncrements,
            autoDetections = if (isAuto) current.autoDetections + 1 else current.autoDetections,
            lastUpdatedTimestamp = System.currentTimeMillis()
        )

        statsDao.insertOrUpdate(updated)
        logDao.logEvent(
            EventLog(
                timestamp = System.currentTimeMillis(),
                appPackage = targetApp,
                source = source,
                countAfter = updated.totalReels
            )
        )

        return@withLock updated.totalReels
    }

    suspend fun undoLastIncrement(): Boolean = mutex.withLock {
        val today = getTodayDateString()
        val current = statsDao.getStatsForDate(today) ?: return false
        if (current.totalReels <= 0) return false

        val updated = current.copy(
            totalReels = (current.totalReels - 1).coerceAtLeast(0),
            manualIncrements = (current.manualIncrements - 1).coerceAtLeast(0),
            lastUpdatedTimestamp = System.currentTimeMillis()
        )
        statsDao.insertOrUpdate(updated)
        logDao.logEvent(
            EventLog(
                timestamp = System.currentTimeMillis(),
                appPackage = "manual",
                source = "UNDO",
                countAfter = updated.totalReels
            )
        )
        return true
    }

    suspend fun updateEstimatedUsage(minutes: Long) = mutex.withLock {
        val today = getTodayDateString()
        val current = statsDao.getStatsForDate(today) ?: DailyStats(dateString = today)
        val updated = current.copy(
            estimatedUsageMinutes = minutes,
            lastUpdatedTimestamp = System.currentTimeMillis()
        )
        statsDao.insertOrUpdate(updated)
    }

    suspend fun clearAllData() = mutex.withLock {
        statsDao.clearAll()
        logDao.clearAll()
    }

    companion object {
        @Volatile
        private var INSTANCE: StatisticsRepository? = null

        fun getInstance(
            statsDao: DailyStatsDao,
            logDao: EventLogDao,
            preferences: MonsterPreferences
        ): StatisticsRepository {
            return INSTANCE ?: synchronized(this) {
                val instance = StatisticsRepository(statsDao, logDao, preferences)
                INSTANCE = instance
                instance
            }
        }
    }
}
