package com.reelmonster.overlay

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
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
import kotlinx.coroutines.flow.first

class MonsterOverlayService : Service(), LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private lateinit var layoutParams: WindowManager.LayoutParams

    private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    // Custom lifecycle host for Jetpack Compose inside WindowManager
    private val lifecycleRegistry = LifecycleRegistry(this)
    private val store = ViewModelStore()
    private val savedStateRegistryController = SavedStateRegistryController.create(this)

    override val lifecycle: Lifecycle get() = lifecycleRegistry
    override val viewModelStore: ViewModelStore get() = store
    override val savedStateRegistry: SavedStateRegistry get() = savedStateRegistryController.savedStateRegistry

    private var currentCount = 0
    private var currentMood = MonsterMood.HAPPY
    private var activeSpeech: String? = null
    private var showPlusOne = false
    private var speechJob: Job? = null

    override fun onCreate() {
        super.onCreate()
        savedStateRegistryController.performRestore(null)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        startForeground(NOTIFICATION_ID, buildForegroundNotification())
        initOverlayWindow()
        observeStats()
    }

    private fun initOverlayWindow() {
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = screenWidth - 220
            y = 350
        }

        val composeView = ComposeView(this).apply {
            setViewTreeLifecycleOwner(this@MonsterOverlayService)
            setViewTreeViewModelStoreOwner(this@MonsterOverlayService)
            setViewTreeSavedStateRegistryOwner(this@MonsterOverlayService)

            setContent {
                MonsterBubble(
                    count = currentCount,
                    mood = currentMood,
                    speechText = activeSpeech,
                    showPlusOne = showPlusOne,
                    onTap = {
                        handleMonsterTapped()
                    },
                    onDismissSpeech = {
                        activeSpeech = null
                        updateComposeView()
                    }
                )
            }
        }

        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isDragging = false
        val touchSlop = 12f

        composeView.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = layoutParams.x
                    initialY = layoutParams.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val deltaX = event.rawX - initialTouchX
                    val deltaY = event.rawY - initialTouchY
                    if (!isDragging && (Math.abs(deltaX) > touchSlop || Math.abs(deltaY) > touchSlop)) {
                        isDragging = true
                    }
                    if (isDragging) {
                        layoutParams.x = (initialX + deltaX).toInt()
                        layoutParams.y = (initialY + deltaY).toInt()
                        windowManager.updateViewLayout(view, layoutParams)
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (!isDragging) {
                        view.performClick()
                        handleMonsterTapped()
                    } else {
                        // Snap smoothly to left or right edge of screen
                        val screenW = resources.displayMetrics.widthPixels
                        val targetX = if (layoutParams.x + (view.width / 2) < screenW / 2) 20 else screenW - view.width - 20
                        layoutParams.x = targetX
                        windowManager.updateViewLayout(view, layoutParams)
                        // Save last position
                        serviceScope.launch {
                            ReelMonsterApp.instance.preferences.saveOverlayPosition(layoutParams.x, layoutParams.y)
                        }
                    }
                    true
                }
                else -> false
            }
        }

        overlayView = composeView
        try {
            windowManager.addView(overlayView, layoutParams)
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun handleMonsterTapped() {
        triggerHaptic()
        serviceScope.launch {
            val app = ReelMonsterApp.instance
            val newCount = app.repository.incrementReelCount(source = "MANUAL_TAP", targetApp = "manual")

            currentCount = newCount
            currentMood = MonsterMood.fromCount(newCount)
            showPlusOne = true

            // Trigger speech bubble with funny dialogue
            activeSpeech = MonsterDialogue.getMessageForCount(newCount)
            updateComposeView()

            // Dismiss +1 badge animation after 800ms
            delay(800)
            showPlusOne = false
            updateComposeView()

            // Auto-dismiss speech after 4.5 seconds
            speechJob?.cancel()
            speechJob = launch {
                delay(4500)
                activeSpeech = null
                updateComposeView()
            }
        }
    }

    private fun triggerHaptic() {
        try {
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(40, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(40)
            }
        } catch (ignored: Exception) {}
    }

    private fun observeStats() {
        serviceScope.launch {
            ReelMonsterApp.instance.repository.todayStatsFlow.collect { stats ->
                currentCount = stats.totalReels
                currentMood = MonsterMood.fromCount(stats.totalReels)
                updateComposeView()
            }
        }
    }

    private fun updateComposeView() {
        (overlayView as? ComposeView)?.setContent {
            MonsterBubble(
                count = currentCount,
                mood = currentMood,
                speechText = activeSpeech,
                showPlusOne = showPlusOne,
                onTap = { handleMonsterTapped() },
                onDismissSpeech = {
                    activeSpeech = null
                    updateComposeView()
                }
            )
        }
    }

    private fun buildForegroundNotification(): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, MonsterOverlayService::class.java).apply {
            action = ACTION_STOP_OVERLAY
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, ReelMonsterApp.OVERLAY_CHANNEL_ID)
            .setContentTitle(getString(R.string.overlay_notification_title))
            .setContentText(getString(R.string.overlay_notification_text))
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .addAction(R.drawable.ic_close, "Hide Bubble", stopPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP_OVERLAY) {
            stopSelf()
            return START_NOT_STICKY
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        store.clear()
        serviceScope.cancel()

        overlayView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        overlayView = null
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID = 1001
        const val ACTION_STOP_OVERLAY = "com.reelmonster.action.STOP_OVERLAY"

        fun start(context: Context) {
            val intent = Intent(context, MonsterOverlayService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, MonsterOverlayService::class.java)
            context.stopService(intent)
        }
    }
}
