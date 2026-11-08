package com.reelmonster.detection

enum class DetectionPlatform {
    INSTAGRAM_REELS,
    YOUTUBE_SHORTS,
    UNKNOWN
}

data class DetectionEvent(
    val platform: DetectionPlatform,
    val packageName: String,
    val transitionId: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class DetectionEngineStatus(
    val isServiceConnected: Boolean = false,
    val activePlatform: DetectionPlatform = DetectionPlatform.UNKNOWN,
    val totalDetectionsToday: Int = 0,
    val lastDetectedTimestamp: Long = 0L,
    val lastVideoSignature: String = ""
)
