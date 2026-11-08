package com.reelmonster

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.lifecycle.lifecycleScope
import com.reelmonster.data.DailyStats
import com.reelmonster.data.OperatingLevel
import com.reelmonster.detection.ReelAccessibilityService
import com.reelmonster.overlay.OverlayManager
import com.reelmonster.tracking.UsageTracker
import com.reelmonster.ui.DashboardScreen
import com.reelmonster.ui.SettingsScreen
import com.reelmonster.ui.theme.ReelMonsterTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val app get() = ReelMonsterApp.instance
    private var isOverlayRunning by mutableStateOf(false)
    private var currentScreen by mutableStateOf("dashboard")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            ReelMonsterTheme {
                val todayStats by app.repository.todayStatsFlow.collectAsState(
                    initial = DailyStats("today")
                )
                val lastSevenDays by app.repository.lastSevenDaysFlow.collectAsState(
                    initial = emptyList()
                )
                val operatingLevel by app.preferences.operatingLevelFlow.collectAsState(
                    initial = OperatingLevel.LEVEL_1_MANUAL
                )
                val speechBubblesEnabled by app.preferences.speechBubblesEnabledFlow.collectAsState(
                    initial = true
                )
                val hapticEnabled by app.preferences.hapticEnabledFlow.collectAsState(
                    initial = true
                )

                var hasOverlayPermission by remember { mutableStateOf(OverlayManager.hasOverlayPermission(this@MainActivity)) }
                var hasAccessibilityPermission by remember { mutableStateOf(ReelAccessibilityService.isAccessibilityServiceEnabled(this@MainActivity)) }
                var hasUsageStatsPermission by remember { mutableStateOf(UsageTracker.hasUsageStatsPermission(this@MainActivity)) }

                LaunchedEffect(Unit) {
                    hasOverlayPermission = OverlayManager.hasOverlayPermission(this@MainActivity)
                    hasAccessibilityPermission = ReelAccessibilityService.isAccessibilityServiceEnabled(this@MainActivity)
                    hasUsageStatsPermission = UsageTracker.hasUsageStatsPermission(this@MainActivity)
                }

                if (currentScreen == "dashboard") {
                    DashboardScreen(
                        todayStats = todayStats,
                        lastSevenDays = lastSevenDays,
                        operatingLevel = operatingLevel,
                        isOverlayActive = isOverlayRunning,
                        onToggleOverlay = { enable ->
                            handleToggleOverlay(enable)
                        },
                        onSwitchLevel = { newLevel ->
                            lifecycleScope.launch {
                                app.preferences.setOperatingLevel(newLevel)
                                if (newLevel == OperatingLevel.LEVEL_2_AUTOMATIC && !hasAccessibilityPermission) {
                                    Toast.makeText(
                                        this@MainActivity,
                                        "Level 2 requires Accessibility permission. Please enable it in Settings.",
                                        Toast.LENGTH_LONG
                                    ).show()
                                    startActivity(ReelAccessibilityService.createAccessibilitySettingsIntent())
                                }
                            }
                        },
                        onManualIncrement = {
                            lifecycleScope.launch {
                                app.repository.incrementReelCount(source = "MANUAL_TAP", targetApp = "manual")
                            }
                        },
                        onUndoIncrement = {
                            lifecycleScope.launch {
                                val success = app.repository.undoLastIncrement()
                                if (success) {
                                    Toast.makeText(this@MainActivity, "Reel count undone (-1)", Toast.LENGTH_SHORT).show()
                                }
                            }
                        },
                        onOpenSettings = {
                            currentScreen = "settings"
                        }
                    )
                } else {
                    SettingsScreen(
                        hasOverlayPermission = hasOverlayPermission,
                        hasAccessibilityPermission = hasAccessibilityPermission,
                        hasUsageStatsPermission = hasUsageStatsPermission,
                        speechBubblesEnabled = speechBubblesEnabled,
                        hapticEnabled = hapticEnabled,
                        onRequestOverlayPermission = {
                            startActivity(OverlayManager.createOverlaySettingsIntent(this@MainActivity))
                        },
                        onRequestAccessibilityPermission = {
                            startActivity(ReelAccessibilityService.createAccessibilitySettingsIntent())
                        },
                        onRequestUsageStatsPermission = {
                            startActivity(UsageTracker.createUsageSettingsIntent())
                        },
                        onToggleSpeechBubbles = { enabled ->
                            lifecycleScope.launch { app.preferences.setSpeechBubblesEnabled(enabled) }
                        },
                        onToggleHaptic = { enabled ->
                            lifecycleScope.launch { app.preferences.setHapticEnabled(enabled) }
                        },
                        onClearAllStats = {
                            lifecycleScope.launch {
                                app.repository.clearAllData()
                                Toast.makeText(this@MainActivity, "All statistics reset.", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onBack = {
                            currentScreen = "dashboard"
                        }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Check overlay state
        lifecycleScope.launch {
            val enabled = app.preferences.overlayEnabledFlow.first()
            isOverlayRunning = enabled && OverlayManager.hasOverlayPermission(this@MainActivity)
        }
    }

    private fun handleToggleOverlay(enable: Boolean) {
        if (enable) {
            if (!OverlayManager.hasOverlayPermission(this)) {
                Toast.makeText(this, "Please grant 'Display over other apps' permission first", Toast.LENGTH_LONG).show()
                startActivity(OverlayManager.createOverlaySettingsIntent(this))
                return
            }
            OverlayManager.startMonsterOverlay(this)
            isOverlayRunning = true
            lifecycleScope.launch { app.preferences.setOverlayEnabled(true) }
        } else {
            OverlayManager.stopMonsterOverlay(this)
            isOverlayRunning = false
            lifecycleScope.launch { app.preferences.setOverlayEnabled(false) }
        }
    }
}
