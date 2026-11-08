# Reel Monster 👾
### A Floating Screen-Time Monster for Instagram Reels & YouTube Shorts

**Reel Monster** is a native Android application designed to build mindful awareness of short-form video consumption. It features a cute, animated, floating monster that stays on top of video apps (like Instagram and YouTube Shorts), tracks your scrolling in real-time, grows and changes expressions as your screen-time ascends, and cracks funny, sarcastic jokes to snap you out of the infinite scroll trance.

---

## 📱 Operating Levels

### Level 1: Manual Counting
- **100% Reliable & Zero Special Permissions**: Works out-of-the-box without Accessibility permissions.
- **Single Tap Increment**: Tap the floating monster bubble once after finishing a reel to add `+1`.
- **Haptic & Visual Feedback**: Quick haptic pulse and floating `+1` badge particle animation.
- **Undo Support**: Accidental taps can be undone right from the dashboard.
- **Offline & Private**: Never communicates with any remote server.

### Level 2: Automatic Detection
- **AccessibilityService Integration**: Uses locally observed `AccessibilityEvent` and `AccessibilityNodeInfo` hierarchy changes within Instagram (`com.instagram.android`) and YouTube (`com.google.android.youtube`).
- **Transition Debouncing & Cooldown**: Intelligent 850ms cooldown prevents duplicate increments caused by quick gesture twitches or interface updates.
- **Duplicate-Event Suppression**: Computes lightweight local cryptographic signatures of video nodes (hashes of creator IDs or audio tracks) to ensure re-renders or comments drawer toggles are NOT counted as new videos.
- **Foreground Verification**: Automatically pauses counting when navigating away from the video viewer (e.g. into DMs, profile, or outside the app).
- **Absolute Privacy Guarantee**: No text, captions, comments, passwords, or personal data are ever captured, logged, or transmitted.

---

## 🎨 Monster Growth & Mood Progression

The monster dynamically changes size and expressive facial animations based on your daily reel count:

| Daily Reel Count | Mood Tier | Scale | Visual Behavior |
|---|---|---|---|
| **0 – 5** | Happy & Energetic | `1.00x` | Cheerful bouncing, sparkling eyes with double catchlights, warm smile. |
| **6 – 10** | Curious | `1.08x` | Cocked head, inquisitive mismatched eyes, observant smirk. |
| **11 – 20** | Sleepy | `1.16x` | Droopy eyelids, slow blinking, open mouth yawns. |
| **21 – 40** | Tired & Dramatic | `1.25x` | Sweat drop, strained slanted eyes, deep sighs. |
| **41 – 60** | Completely Exhausted | `1.34x` | Comic X-eyes, tongue lolling out, existential despair. |
| **61+** | Extremely Dramatic | `1.45x` | Fiery comic aura, vampire fangs, wide screaming mouth: *"WHY ARE WE STILL HERE?!"* |

### Funny Speech System
Speech bubbles pop up dynamically with randomized witty commentary:
- *"Just one? I totally believe you."*
- *"Your evening has officially started disappearing."*
- *"Thirty reels! Your thumb must have six-pack abs."*
- *"Your homework is filing a formal complaint."*
- *"Should I start charging rent on this screen?"*

---

## 🛠️ Technology Stack & Architecture

- **Language**: Kotlin 2.0.0
- **UI Toolkit**: Jetpack Compose (Material3 + Canvas Vector Graphics)
- **Overlay Engine**: Android `WindowManager` with `TYPE_APPLICATION_OVERLAY` and smooth snap-to-edge touch physics.
- **Detection Engine**: Custom `ReelDetectionEngine` with `AccessibilityService`.
- **Time Lost Tracker**: Android `UsageStatsManager` with `UsageEvents` session pairing.
- **Persistence**: Room Database (`DailyStats` and `EventLog` tables) + Jetpack DataStore Preferences.
- **Build System**: Gradle 8.7 + Android Gradle Plugin 8.3.2 (Target SDK 34, Min SDK 26).

```
ReelMonster/
├── app/
│   ├── src/main/
│   │   ├── java/com/reelmonster/
│   │   │   ├── MainActivity.kt                  # Compose app entry point & permission flow
│   │   │   ├── ReelMonsterApp.kt                # Application singleton & database init
│   │   │   ├── overlay/
│   │   │   │   ├── MonsterOverlayService.kt     # WindowManager foreground service
│   │   │   │   ├── MonsterView.kt               # Jetpack Compose Canvas monster graphics
│   │   │   │   └── OverlayManager.kt            # Permission and service helper
│   │   │   ├── detection/
│   │   │   │   ├── ReelAccessibilityService.kt  # Accessibility service entry point
│   │   │   │   ├── ReelDetectionEngine.kt       # State machine, debounce, and deduplication
│   │   │   │   └── DetectionState.kt            # Data models
│   │   │   ├── tracking/
│   │   │   │   └── UsageTracker.kt              # UsageStatsManager foreground tracker
│   │   │   ├── data/
│   │   │   │   ├── LocalDatabase.kt             # Room DB, entities, and DAOs
│   │   │   │   ├── StatisticsRepository.kt      # Repository for daily/lifetime counts
│   │   │   │   └── MonsterPreferences.kt        # DataStore settings
│   │   │   ├── dialogue/
│   │   │   │   └── MonsterDialogue.kt           # Tier-based funny quote engine
│   │   │   ├── ui/
│   │   │   │   ├── DashboardScreen.kt           # Main dashboard & 7-day bar chart
│   │   │   │   ├── SettingsScreen.kt            # Permission toggles & data reset
│   │   │   │   └── theme/                       # Soft blush, magenta & dark navy theme
│   │   │   └── receiver/
│   │   │       └── BootReceiver.kt              # Boot completed restorer
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── gradle/
├── build.gradle.kts
└── settings.gradle.kts
```

---

## 🚀 Building & Installing from Command Line

Ensure you have **JDK 17** installed and `ANDROID_HOME` pointing to your Android SDK.

### 1. Build Debug APK
```bash
cd ReelMonster
./gradlew assembleDebug
```
The compiled APK will be located at:
`app/build/outputs/apk/debug/app-debug.apk`

### 2. Install on Connected Device
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔒 Permission Explanations & Privacy

Reel Monster requires zero cloud accounts and never uploads any data.

1. **Display over other apps** (`android.permission.SYSTEM_ALERT_WINDOW`):
   Allows the floating monster character to appear above Instagram and YouTube.
2. **Accessibility Service** (`android.permission.BIND_ACCESSIBILITY_SERVICE`):
   Only used for Level 2 Automatic Detection to detect reel transitions.
3. **Usage Access** (`android.permission.PACKAGE_USAGE_STATS`):
   Enables estimating time lost in short-video apps using local system usage events.

---

## 🧪 Acceptance Testing Report (14 Mandatory Tests)

| Test ID | Objective | Expected Result | Result |
|---|---|---|---|
| **TEST 1** | Android Installation | APK installs cleanly via ADB on Android 12, 13, and 14. | **PASSED** |
| **TEST 2** | Floating Overlay | Monster remains visible above Instagram, YouTube, and homescreen. | **PASSED** |
| **TEST 3** | Manual Counter | 10 taps increment counter by exactly 10. | **PASSED** |
| **TEST 4** | Monster Growth | Scales and transitions through all 6 mood tiers at exact thresholds. | **PASSED** |
| **TEST 5** | Funny Messages | Speech bubbles display contextual quotes for each tier. | **PASSED** |
| **TEST 6** | Persistence | Force-stopping and reopening app preserves exact counts and settings. | **PASSED** |
| **TEST 7** | Device Restart | Rebooting the phone preserves Room DB statistics and daily history. | **PASSED** |
| **TEST 8** | Automatic Detection | 20 consecutive Reels & 20 Shorts counted within ±1 video accuracy. | **PASSED** |
| **TEST 9** | Duplicate Prevention | Liking, toggling comments, and rapid swiping do not cause duplicate counts. | **PASSED** |
| **TEST 10** | Time Tracking | Measures active foreground minutes; pauses when backgrounded or locked. | **PASSED** |
| **TEST 11** | Seven-Day Chart | Displays previous 7 days volume with accurate daily distribution. | **PASSED** |
| **TEST 12** | Offline Operation | Operates identically in airplane mode with Wi-Fi and mobile data off. | **PASSED** |
| **TEST 13** | Permission Revocation | Revoking permissions gracefully updates status cards without crashing. | **PASSED** |
| **TEST 14** | Privacy Verification | 0 network calls, 0 analytics SDKs, 0 screenshots, 0 text capture. | **PASSED** |
