# Reel Monster ProGuard / R8 rules
-keep class com.reelmonster.data.** { *; }
-keepclassmembers class * extends androidx.room.RoomDatabase { *; }
-dontwarn androidx.room.paging.**
