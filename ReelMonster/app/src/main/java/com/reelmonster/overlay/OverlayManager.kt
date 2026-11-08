package com.reelmonster.overlay

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings

object OverlayManager {

    /**
     * Checks if the app has permission to draw on top of other apps.
     */
    fun hasOverlayPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }

    /**
     * Creates intent to guide user to standard Android Settings to grant overlay permission.
     */
    fun createOverlaySettingsIntent(context: Context): Intent {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            )
        } else {
            Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
            }
        }
    }

    fun startMonsterOverlay(context: Context) {
        if (hasOverlayPermission(context)) {
            MonsterOverlayService.start(context)
        }
    }

    fun stopMonsterOverlay(context: Context) {
        MonsterOverlayService.stop(context)
    }
}
