package com.reelmonster.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.reelmonster.ReelMonsterApp
import com.reelmonster.overlay.OverlayManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            CoroutineScope(Dispatchers.IO).launch {
                val overlayEnabled = ReelMonsterApp.instance.preferences.overlayEnabledFlow.first()
                if (overlayEnabled && OverlayManager.hasOverlayPermission(context)) {
                    OverlayManager.startMonsterOverlay(context)
                }
            }
        }
    }
}
