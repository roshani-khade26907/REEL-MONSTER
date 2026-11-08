package com.reelmonster.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

/**
 * Daily statistics table for tracking short-form video consumption.
 * Persists across app closures and phone reboots.
 */
@Entity(tableName = "daily_statistics")
data class DailyStats(
    @PrimaryKey
    val dateString: String, // Format: YYYY-MM-DD
    val totalReels: Int = 0,
    val instagramCount: Int = 0,
    val youtubeShortsCount: Int = 0,
    val manualIncrements: Int = 0,
    val autoDetections: Int = 0,
    val estimatedUsageMinutes: Long = 0L,
    val lastUpdatedTimestamp: Long = System.currentTimeMillis()
)

/**
 * Event log for debugging and verifying detection events and undo operations.
 */
@Entity(tableName = "event_logs")
data class EventLog(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val appPackage: String, // com.instagram.android or com.google.android.youtube or manual
    val source: String, // "MANUAL_TAP", "AUTO_DETECTED", "UNDO"
    val countAfter: Int
)

@Dao
interface DailyStatsDao {
    @Query("SELECT * FROM daily_statistics WHERE dateString = :date LIMIT 1")
    suspend fun getStatsForDate(date: String): DailyStats?

    @Query("SELECT * FROM daily_statistics WHERE dateString = :date LIMIT 1")
    fun observeStatsForDate(date: String): Flow<DailyStats?>

    @Query("SELECT * FROM daily_statistics ORDER BY dateString DESC LIMIT 7")
    fun observeLastSevenDays(): Flow<List<DailyStats>>

    @Query("SELECT * FROM daily_statistics ORDER BY dateString DESC LIMIT 7")
    suspend fun getLastSevenDays(): List<DailyStats>

    @Query("SELECT SUM(totalReels) FROM daily_statistics")
    fun observeLifetimeReels(): Flow<Int?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stats: DailyStats)

    @Query("DELETE FROM daily_statistics")
    suspend fun clearAll()
}

@Dao
interface EventLogDao {
    @Insert
    suspend fun logEvent(event: EventLog)

    @Query("SELECT * FROM event_logs ORDER BY timestamp DESC LIMIT 50")
    fun observeRecentLogs(): Flow<List<EventLog>>

    @Query("DELETE FROM event_logs")
    suspend fun clearAll()
}

@Database(entities = [DailyStats::class, EventLog::class], version = 1, exportSchema = false)
abstract class LocalDatabase : RoomDatabase() {
    abstract fun dailyStatsDao(): DailyStatsDao
    abstract fun eventLogDao(): EventLogDao

    companion object {
        @Volatile
        private var INSTANCE: LocalDatabase? = null

        fun getInstance(context: Context): LocalDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    LocalDatabase::class.java,
                    "reel_monster_local.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
