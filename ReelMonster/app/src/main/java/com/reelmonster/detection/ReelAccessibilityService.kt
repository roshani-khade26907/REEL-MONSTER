package com.reelmonster.detection

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import android.view.accessibility.AccessibilityEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

class ReelAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private lateinit var engine: ReelDetectionEngine

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        engine = ReelDetectionEngine(serviceScope)
        engine.onServiceConnected()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        try {
            val root = rootInActiveWindow
            engine.onAccessibilityEvent(event, root)
        } catch (e: Exception) {
            // Protect accessibility service from any unexpected tree changes
        }
    }

    override fun onInterrupt() {
        engine.onServiceDisconnected()
    }

    override fun onDestroy() {
        super.onDestroy()
        engine.onServiceDisconnected()
        serviceScope.cancel()
        instance = null
    }

    companion object {
        var instance: ReelAccessibilityService? = null
            private set

        /**
         * Checks whether the user has enabled Reel Monster in Android Accessibility settings.
         */
        fun isAccessibilityServiceEnabled(context: Context): Boolean {
            val expectedServiceName = "${context.packageName}/${ReelAccessibilityService::class.java.name}"
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false

            val colonSplitter = TextUtils.SimpleStringSplitter(':')
            colonSplitter.setString(enabledServices)
            while (colonSplitter.hasNext()) {
                val componentName = colonSplitter.next()
                if (componentName.equals(expectedServiceName, ignoreCase = true)) {
                    return true
                }
            }
            return false
        }

        fun createAccessibilitySettingsIntent(): Intent {
            return Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        }
    }
}
