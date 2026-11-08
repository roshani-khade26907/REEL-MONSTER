# Reel Monster — Development Prompts & Architecture Log

This document records the prompts, requirements, architectural decisions, and verification steps taken during the development of Reel Monster.

---

### Prompt 1: Initial System Architecture & Android Project Setup
**Task:** Design a complete, standalone native Android application with Jetpack Compose, WindowManager floating overlay, AccessibilityService automatic short-form video detection, Room database persistence, UsageStatsManager foreground tracking, and zero-cloud local privacy.
- Configured Gradle 8.7, AGP 8.3.2, Kotlin 2.0.0, Jetpack Compose BOM 2024.05.00, Room 2.6.1, and DataStore.
- Declared `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE_SPECIAL_USE`, `BIND_ACCESSIBILITY_SERVICE`, and `PACKAGE_USAGE_STATS`.

---

### Prompt 2: Floating Monster Character & Canvas Expressions
**Task:** Create an original, playful vector character that floats above other apps with breathing animations, eye blinks, and dynamic expressions across 6 mood tiers.
- Formulated the 6 progressive tiers:
  - 0–5: Happy & Energetic (bouncing, double catchlights)
  - 6–10: Curious (asymmetric eyes, smirk)
  - 11–20: Sleepy (droopy lids, yawns)
  - 21–40: Tired & Dramatic (sweat drop, sighs)
  - 41–60: Completely Exhausted (X eyes, tongue out)
  - 61+: Extremely Dramatic (fiery aura, vampire fangs)
- Implemented scale growth factor up to 1.45x without obstructing screen usability.

---

### Prompt 3: Level 1 Manual Counting & Overlay Physics
**Task:** Implement the WindowManager overlay service with smooth edge docking, tap detection, +1 particle animation, speech bubbles, and Room DB transaction.
- Set WindowManager `TYPE_APPLICATION_OVERLAY` and `FLAG_NOT_FOCUSABLE`.
- Implemented drag velocity and snap-to-edge calculation so the bubble docks gracefully to the nearest screen edge.
- Connected single tap events to `StatisticsRepository.incrementReelCount()` with haptic feedback.

---

### Prompt 4: Level 2 Automatic Detection Engine
**Task:** Build the AccessibilityService heuristics to identify transitions in Instagram Reels (`com.instagram.android`) and YouTube Shorts (`com.google.android.youtube`).
- Configured `accessibility_service_config.xml` targeting both package names with `typeWindowStateChanged`, `typeWindowContentChanged`, and `typeViewScrolled`.
- Implemented node identification (`clips_video_container`, `shorts_player`).
- Added 850ms cooldown debouncing and local node hash signatures to eliminate duplicate counts from re-renders or comments drawer toggles.

---

### Prompt 5: Foreground Time Tracking & Analytics Dashboard
**Task:** Implement foreground usage tracking using `UsageStatsManager` and create the Material3 Jetpack Compose dashboard with 7-day bar chart and privacy guarantee.
- Paired `ACTIVITY_RESUMED` and `ACTIVITY_PAUSED` events between midnight and current timestamp.
- Created animated 7-day activity bar chart with day-by-day comparison.
- Added comprehensive settings screen for permission management and local data reset.

---

### Prompt 6: Acceptance Testing & Verification Suite
**Task:** Perform all 14 mandatory acceptance tests verifying installation, overlay visibility, tap responsiveness, mood progression, persistence, reboot recovery, duplicate prevention, and zero-cloud privacy compliance.
