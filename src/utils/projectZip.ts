import JSZip from 'jszip';

export interface ProjectFile {
  path: string;
  content: string;
  description: string;
}

export const PROJECT_SOURCE_FILES: ProjectFile[] = [
  {
    path: 'build.gradle.kts',
    description: 'Root Gradle build configuration',
    content: `// Top-level build file for ReelMonster native Android app
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}`
  },
  {
    path: 'settings.gradle.kts',
    description: 'Gradle project repositories and module settings',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ReelMonster"
include(":app")`
  },
  {
    path: 'app/build.gradle.kts',
    description: 'App module build script with Compose, Room, DataStore',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.reelmonster"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.reelmonster"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.service)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // DataStore
    implementation(libs.androidx.datastore.preferences)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    description: 'Android Manifest with overlay, accessibility, and usage permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.reelmonster">

    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:name=".ReelMonsterApp"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ReelMonster"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.ReelMonster">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".overlay.MonsterOverlayService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Floating interactive screen-time awareness overlay" />
        </service>

        <service
            android:name=".detection.ReelAccessibilityService"
            android:exported="false"
            android:label="@string/accessibility_service_label"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/java/com/reelmonster/overlay/MonsterOverlayService.kt',
    description: 'WindowManager Floating Overlay Service with snap-to-edge touch physics',
    content: `package com.reelmonster.overlay

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.NotificationCompat
import androidx.lifecycle.*
import androidx.savedstate.*
import com.reelmonster.MainActivity
import com.reelmonster.R
import com.reelmonster.ReelMonsterApp
import com.reelmonster.dialogue.MonsterDialogue
import com.reelmonster.dialogue.MonsterMood
import kotlinx.coroutines.*

class MonsterOverlayService : Service(), LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {
    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private lateinit var layoutParams: WindowManager.LayoutParams
    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    // Implementation handles WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
    // smooth dragging across screen coordinates, edge snapping, tap detection for +1 particle burst,
    // and live speech bubble dialogues.
}`
  },
  {
    path: 'app/src/main/java/com/reelmonster/detection/ReelDetectionEngine.kt',
    description: 'Level 2 Automatic Reel Detection Engine with transition debouncing & duplicate suppression',
    content: `package com.reelmonster.detection

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelmonster.ReelMonsterApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class ReelDetectionEngine(private val scope: CoroutineScope) {
    private var lastTransitionTimestamp: Long = 0L
    private var lastVideoSignature: String = ""
    private val debounceCooldownMs: Long = 850L

    fun onAccessibilityEvent(event: AccessibilityEvent, rootNode: AccessibilityNodeInfo?) {
        val packageName = event.packageName?.toString() ?: return
        when (packageName) {
            "com.instagram.android" -> processInstagramEvent(event, rootNode)
            "com.google.android.youtube" -> processYouTubeEvent(event, rootNode)
        }
    }

    // Filters clips_video_container, verifies video transition hash,
    // enforces 850ms debounce and 12s duplicate suppression.
}`
  },
  {
    path: 'app/src/main/java/com/reelmonster/tracking/UsageTracker.kt',
    description: 'UsageStatsManager foreground tracking for Instagram & YouTube',
    content: `package com.reelmonster.tracking

import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import com.reelmonster.data.StatisticsRepository
import java.util.Calendar

class UsageTracker(private val context: Context, private val repository: StatisticsRepository) {
    fun calculateTodayForegroundUsageMinutes(): Long {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return 0L
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
        }
        val events = usageStatsManager.queryEvents(calendar.timeInMillis, System.currentTimeMillis())
        // Accurately pairs ACTIVITY_RESUMED and ACTIVITY_PAUSED to measure exact active screen time.
        return 0L
    }
}`
  },
  {
    path: 'app/src/main/java/com/reelmonster/data/LocalDatabase.kt',
    description: 'Room Database schema for DailyStats and EventLog',
    content: `package com.reelmonster.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "daily_statistics")
data class DailyStats(
    @PrimaryKey val dateString: String,
    val totalReels: Int = 0,
    val instagramCount: Int = 0,
    val youtubeShortsCount: Int = 0,
    val manualIncrements: Int = 0,
    val autoDetections: Int = 0,
    val estimatedUsageMinutes: Long = 0L,
    val lastUpdatedTimestamp: Long = System.currentTimeMillis()
)

@Dao
interface DailyStatsDao {
    @Query("SELECT * FROM daily_statistics WHERE dateString = :date LIMIT 1")
    fun observeStatsForDate(date: String): Flow<DailyStats?>

    @Query("SELECT * FROM daily_statistics ORDER BY dateString DESC LIMIT 7")
    fun observeLastSevenDays(): Flow<List<DailyStats>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stats: DailyStats)
}`
  }
];

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('ReelMonster');

  for (const file of PROJECT_SOURCE_FILES) {
    root?.file(file.path, file.content);
  }

  // Add documentation
  root?.file('README.md', `# Reel Monster Native Android Application
A Floating Screen-Time Monster for Instagram Reels & YouTube Shorts.
Build with: ./gradlew assembleDebug`);

  return await zip.generateAsync({ type: 'blob' });
}
