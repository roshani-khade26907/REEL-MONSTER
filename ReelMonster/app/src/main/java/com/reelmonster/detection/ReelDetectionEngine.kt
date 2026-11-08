package com.reelmonster.detection

import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.reelmonster.ReelMonsterApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ReelDetectionEngine(
    private val scope: CoroutineScope
) {
    private val _status = MutableStateFlow(DetectionEngineStatus())
    val status = _status.asStateFlow()

    private var lastTransitionTimestamp: Long = 0L
    private var lastVideoSignature: String = ""
    private var currentPlatform: DetectionPlatform = DetectionPlatform.UNKNOWN

    // Debounce cooldown: humans cannot watch/swipe a reel faster than ~750ms without skipping
    private val debounceCooldownMs: Long = 850L

    fun onAccessibilityEvent(event: AccessibilityEvent, rootNode: AccessibilityNodeInfo?) {
        val packageName = event.packageName?.toString() ?: return

        when (packageName) {
            INSTAGRAM_PACKAGE -> processInstagramEvent(event, rootNode)
            YOUTUBE_PACKAGE -> processYouTubeEvent(event, rootNode)
            else -> {
                if (currentPlatform != DetectionPlatform.UNKNOWN) {
                    currentPlatform = DetectionPlatform.UNKNOWN
                    _status.value = _status.value.copy(activePlatform = DetectionPlatform.UNKNOWN)
                }
            }
        }
    }

    private fun processInstagramEvent(event: AccessibilityEvent, rootNode: AccessibilityNodeInfo?) {
        currentPlatform = DetectionPlatform.INSTAGRAM_REELS
        _status.value = _status.value.copy(activePlatform = currentPlatform)

        if (rootNode == null) return

        // 1. Verify we are in the Reels viewer container
        // Instagram uses Clips viewer pager or recycler with specific view IDs
        val isClipsViewer = findNodeByKeywords(
            rootNode,
            listOf("clips_video_container", "clips_viewer", "reel_viewer", "clips_swipe_refresh_container", "like_button", "audio_pill")
        )

        if (!isClipsViewer) return

        // 2. Extract a lightweight local signature for the currently active clip
        // (e.g. author username handle or audio track title - no text stored, only hash code for transition detection)
        val signature = extractNodeSignature(rootNode, "instagram")
        if (signature.isEmpty()) return

        evaluateTransition(DetectionPlatform.INSTAGRAM_REELS, INSTAGRAM_PACKAGE, signature)
    }

    private fun processYouTubeEvent(event: AccessibilityEvent, rootNode: AccessibilityNodeInfo?) {
        currentPlatform = DetectionPlatform.YOUTUBE_SHORTS
        _status.value = _status.value.copy(activePlatform = currentPlatform)

        if (rootNode == null) return

        // 1. Verify we are in the Shorts player viewport
        // YouTube uses reel_player or shorts_pager_carousel
        val isShortsPlayer = findNodeByKeywords(
            rootNode,
            listOf("shorts_player", "reel_player", "shorts_container", "sound_button", "subscribe_button")
        )

        if (!isShortsPlayer) return

        // 2. Extract local signature
        val signature = extractNodeSignature(rootNode, "youtube")
        if (signature.isEmpty()) return

        evaluateTransition(DetectionPlatform.YOUTUBE_SHORTS, YOUTUBE_PACKAGE, signature)
    }

    private fun evaluateTransition(platform: DetectionPlatform, pkg: String, signature: String) {
        val now = System.currentTimeMillis()

        // Debounce check
        if (now - lastTransitionTimestamp < debounceCooldownMs) {
            return
        }

        // Duplicate video suppression
        if (signature == lastVideoSignature && (now - lastTransitionTimestamp) < 12_000L) {
            return
        }

        // New reel detected!
        lastTransitionTimestamp = now
        lastVideoSignature = signature

        scope.launch(Dispatchers.IO) {
            val app = ReelMonsterApp.instance
            app.repository.incrementReelCount(
                source = "AUTO_DETECTED",
                targetApp = pkg
            )

            _status.value = _status.value.copy(
                totalDetectionsToday = _status.value.totalDetectionsToday + 1,
                lastDetectedTimestamp = now,
                lastVideoSignature = signature
            )
        }
    }

    private fun findNodeByKeywords(root: AccessibilityNodeInfo, keywords: List<String>): Boolean {
        for (keyword in keywords) {
            val matches = root.findAccessibilityNodeInfosByViewId("*:id/$keyword")
            if (matches.isNotEmpty()) return true
        }
        return false
    }

    /**
     * Extracts an anonymous hash signature representing the current video item,
     * ensuring NO text, passwords, or video content are ever stored or retained.
     */
    private fun extractNodeSignature(root: AccessibilityNodeInfo, prefix: String): String {
        val sb = StringBuilder(prefix)
        try {
            // Check author / channel view ID hash
            val channelNodes = root.findAccessibilityNodeInfosByViewId("*:id/channel_name") +
                    root.findAccessibilityNodeInfosByViewId("*:id/user_name")
            if (channelNodes.isNotEmpty()) {
                val text = channelNodes[0].text?.toString().orEmpty()
                sb.append("_").append(text.hashCode())
            }

            // Check sound / audio ID hash
            val soundNodes = root.findAccessibilityNodeInfosByViewId("*:id/sound_title") +
                    root.findAccessibilityNodeInfosByViewId("*:id/clips_audio")
            if (soundNodes.isNotEmpty()) {
                val text = soundNodes[0].text?.toString().orEmpty()
                sb.append("_").append(text.hashCode())
            }
        } catch (ignored: Exception) {}

        return if (sb.length > prefix.length + 1) sb.toString() else ""
    }

    fun onServiceConnected() {
        _status.value = _status.value.copy(isServiceConnected = true)
    }

    fun onServiceDisconnected() {
        _status.value = _status.value.copy(isServiceConnected = false, activePlatform = DetectionPlatform.UNKNOWN)
    }

    companion object {
        const val INSTAGRAM_PACKAGE = "com.instagram.android"
        const val YOUTUBE_PACKAGE = "com.google.android.youtube"
    }
}
