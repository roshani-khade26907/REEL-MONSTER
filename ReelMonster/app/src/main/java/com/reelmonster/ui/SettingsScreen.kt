package com.reelmonster.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelmonster.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    hasOverlayPermission: Boolean,
    hasAccessibilityPermission: Boolean,
    hasUsageStatsPermission: Boolean,
    speechBubblesEnabled: Boolean,
    hapticEnabled: Boolean,
    onRequestOverlayPermission: () -> Unit,
    onRequestAccessibilityPermission: () -> Unit,
    onRequestUsageStatsPermission: () -> Unit,
    onToggleSpeechBubbles: (Boolean) -> Unit,
    onToggleHaptic: (Boolean) -> Unit,
    onClearAllStats: () -> Unit,
    onBack: () -> Unit
) {
    var showConfirmClearDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Permissions", fontWeight = FontWeight.Bold, color = MonsterDarkNavy) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MonsterDarkNavy)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MonsterBlushBg)
            )
        },
        containerColor = MonsterBlushBg
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("System Permissions", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MonsterDarkNavy)

            PermissionStatusCard(
                title = "Display Over Other Apps",
                description = "Allows the Monster bubble to float over Instagram & YouTube.",
                isGranted = hasOverlayPermission,
                actionLabel = "Grant Permission",
                onAction = onRequestOverlayPermission
            )

            PermissionStatusCard(
                title = "Accessibility Service (Level 2)",
                description = "Enables automatic reel transition detection. 100% on-device.",
                isGranted = hasAccessibilityPermission,
                actionLabel = "Enable in Settings",
                onAction = onRequestAccessibilityPermission
            )

            PermissionStatusCard(
                title = "Usage Access",
                description = "Allows estimating time spent inside short-form video apps.",
                isGranted = hasUsageStatsPermission,
                actionLabel = "Grant Access",
                onAction = onRequestUsageStatsPermission
            )

            Text("Monster Feedback", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MonsterDarkNavy)

            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Funny Speech Bubbles", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            Text("Show sarcastic comments based on scrolling volume.", fontSize = 12.sp, color = MonsterSubtextMuted)
                        }
                        Switch(
                            checked = speechBubblesEnabled,
                            onCheckedChange = onToggleSpeechBubbles,
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = MonsterPink)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = MonsterBorder)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Haptic Feedback", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            Text("Vibrate gently when tapping monster to count.", fontSize = 12.sp, color = MonsterSubtextMuted)
                        }
                        Switch(
                            checked = hapticEnabled,
                            onCheckedChange = onToggleHaptic,
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = MonsterPink)
                        )
                    }
                }
            }

            Text("Data & Privacy", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MonsterDarkNavy)

            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Reel Monster is engineered strictly for privacy: zero analytics SDKs, zero cloud sync, zero background uploads. All counting and time estimates remain exclusively in your phone's Room database.",
                        fontSize = 12.sp,
                        color = MonsterSubtextMuted,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = { showConfirmClearDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Reset All Statistics")
                    }
                }
            }
        }
    }

    if (showConfirmClearDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmClearDialog = false },
            title = { Text("Reset All Statistics?") },
            text = { Text("This will permanently clear all daily reel records, lifetime counters, and usage logs.") },
            confirmButton = {
                TextButton(onClick = {
                    showConfirmClearDialog = false
                    onClearAllStats()
                }) {
                    Text("Clear All", color = Color(0xFFEF4444), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmClearDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun PermissionStatusCard(
    title: String,
    description: String,
    isGranted: Boolean,
    actionLabel: String,
    onAction: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, RoundedCornerShape(18.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MonsterDarkNavy)
                Box(
                    modifier = Modifier
                        .background(
                            if (isGranted) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
                            RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = if (isGranted) "Granted" else "Missing",
                        color = if (isGranted) Color(0xFF166534) else Color(0xFF991B1B),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = description, fontSize = 12.sp, color = MonsterSubtextMuted)

            if (!isGranted) {
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedButton(
                    onClick = onAction,
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MonsterPink),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(actionLabel, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
