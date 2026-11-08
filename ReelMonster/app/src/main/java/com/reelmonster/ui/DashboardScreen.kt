package com.reelmonster.ui

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelmonster.data.DailyStats
import com.reelmonster.data.OperatingLevel
import com.reelmonster.dialogue.MonsterDialogue
import com.reelmonster.dialogue.MonsterMood
import com.reelmonster.overlay.MonsterBubble
import com.reelmonster.ui.theme.*

@Composable
fun DashboardScreen(
    todayStats: DailyStats,
    lastSevenDays: List<DailyStats>,
    operatingLevel: OperatingLevel,
    isOverlayActive: Boolean,
    onToggleOverlay: (Boolean) -> Unit,
    onSwitchLevel: (OperatingLevel) -> Unit,
    onManualIncrement: () -> Unit,
    onUndoIncrement: () -> Unit,
    onOpenSettings: () -> Unit
) {
    val scrollState = rememberScrollState()
    val mood = MonsterMood.fromCount(todayStats.totalReels)
    var currentSpeech by remember { mutableStateOf(MonsterDialogue.getMessageForCount(todayStats.totalReels)) }

    LaunchedEffect(todayStats.totalReels) {
        currentSpeech = MonsterDialogue.getMessageForCount(todayStats.totalReels)
    }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MonsterBlushBg)
                    .padding(horizontal = 20.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(MonsterPink),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("👾", fontSize = 20.sp)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Reel Monster",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MonsterDarkNavy
                        )
                        Text(
                            text = if (operatingLevel == OperatingLevel.LEVEL_1_MANUAL) "Level 1 • Manual" else "Level 2 • Auto-Detect",
                            fontSize = 11.sp,
                            color = MonsterSubtextMuted
                        )
                    }
                }

                IconButton(onClick = onOpenSettings) {
                    Icon(Icons.Default.Settings, contentDescription = "Settings", tint = MonsterDarkNavy)
                }
            }
        },
        containerColor = MonsterBlushBg
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // Monster Hero Card
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(4.dp, RoundedCornerShape(24.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Floating Monster Preview with tap action
                    MonsterBubble(
                        count = todayStats.totalReels,
                        mood = mood,
                        speechText = currentSpeech,
                        showPlusOne = false,
                        onTap = {
                            currentSpeech = MonsterDialogue.getMessageForCount(todayStats.totalReels)
                        },
                        onDismissSpeech = { currentSpeech = "" }
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = mood.tierName,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MonsterDarkNavy
                    )
                    Text(
                        text = mood.description,
                        fontSize = 12.sp,
                        color = MonsterSubtextMuted,
                        modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                    )

                    // Quick action buttons: Manual +1 and Undo
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = onManualIncrement,
                            colors = ButtonDefaults.buttonColors(containerColor = MonsterPink),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Count Reel (+1)", fontWeight = FontWeight.Bold)
                        }

                        if (todayStats.totalReels > 0) {
                            OutlinedButton(
                                onClick = onUndoIncrement,
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Icon(Icons.Default.Undo, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Undo")
                            }
                        }
                    }
                }
            }

            // Overlay Floating Toggle Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isOverlayActive) Color(0xFFFDF2F8) else MonsterCardWhite
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Floating Overlay Bubble",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = MonsterDarkNavy
                        )
                        Text(
                            text = if (isOverlayActive) "Active over Instagram & YouTube" else "Hidden. Enable to float above apps.",
                            fontSize = 12.sp,
                            color = MonsterSubtextMuted
                        )
                    }
                    Switch(
                        checked = isOverlayActive,
                        onCheckedChange = onToggleOverlay,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = MonsterPink
                        )
                    )
                }
            }

            // Operating Level Selector Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Operating Mode",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MonsterDarkNavy
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        LevelSelectionChip(
                            title = "Level 1 • Manual",
                            subtitle = "Tap to count, 100% offline",
                            isSelected = operatingLevel == OperatingLevel.LEVEL_1_MANUAL,
                            modifier = Modifier.weight(1f),
                            onClick = { onSwitchLevel(OperatingLevel.LEVEL_1_MANUAL) }
                        )
                        LevelSelectionChip(
                            title = "Level 2 • Auto",
                            subtitle = "Detects Reels & Shorts",
                            isSelected = operatingLevel == OperatingLevel.LEVEL_2_AUTOMATIC,
                            modifier = Modifier.weight(1f),
                            onClick = { onSwitchLevel(OperatingLevel.LEVEL_2_AUTOMATIC) }
                        )
                    }
                }
            }

            // Today's Activity Grid
            Text(
                text = "Today's Consumption",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MonsterDarkNavy
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricCard(
                    title = "Reels Watched",
                    value = todayStats.totalReels.toString(),
                    badge = "Today",
                    accentColor = MonsterPink,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Estimated Time",
                    value = "${todayStats.estimatedUsageMinutes} min",
                    badge = "Foreground",
                    accentColor = MonsterYellowAccent,
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricCard(
                    title = "Instagram Reels",
                    value = todayStats.instagramCount.toString(),
                    badge = "Clips",
                    accentColor = Color(0xFFE1306C),
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "YouTube Shorts",
                    value = todayStats.youtubeShortsCount.toString(),
                    badge = "Shorts",
                    accentColor = Color(0xFFFF0000),
                    modifier = Modifier.weight(1f)
                )
            }

            // Seven-Day Bar Chart Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Last 7 Days Activity",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MonsterDarkNavy
                    )
                    Text(
                        text = "Daily reel volume comparison",
                        fontSize = 12.sp,
                        color = MonsterSubtextMuted,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    SevenDayBarChart(days = lastSevenDays)
                }
            }

            // Privacy Guarantee Notice
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Lock,
                        contentDescription = "Privacy",
                        tint = MonsterSubtextMuted,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Reel Monster processes activity locally on your device. It does not require an account and does not upload your viewing activity to a server.",
                        fontSize = 11.sp,
                        color = MonsterSubtextMuted,
                        lineHeight = 15.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun LevelSelectionChip(
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(if (isSelected) MonsterPink else Color(0xFFF8FAFC))
            .clickable { onClick() }
            .padding(12.dp)
    ) {
        Column {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) Color.White else MonsterDarkNavy
            )
            Text(
                text = subtitle,
                fontSize = 10.sp,
                color = if (isSelected) Color.White.copy(alpha = 0.85f) else MonsterSubtextMuted
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    badge: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MonsterCardWhite),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontSize = 12.sp, color = MonsterSubtextMuted)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(accentColor.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(text = badge, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = accentColor)
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MonsterDarkNavy
            )
        }
    }
}

@Composable
fun SevenDayBarChart(days: List<DailyStats>) {
    val maxCount = (days.maxOfOrNull { it.totalReels } ?: 1).coerceAtLeast(10)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        val displayList = if (days.isEmpty()) {
            List(7) { DailyStats("Day $it", totalReels = 0) }
        } else {
            days.take(7).reversed()
        }

        displayList.forEach { stat ->
            val heightRatio = (stat.totalReels.toFloat() / maxCount).coerceIn(0.06f, 1f)
            val dateLabel = stat.dateString.takeLast(5) // MM-DD

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Bottom,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = stat.totalReels.toString(),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (stat.totalReels > 0) MonsterPink else MonsterSubtextMuted
                )
                Spacer(modifier = Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .width(18.dp)
                        .fillMaxHeight(heightRatio)
                        .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                        .background(
                            if (stat.totalReels > 25) MonsterMagenta else MonsterPink
                        )
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = dateLabel,
                    fontSize = 9.sp,
                    color = MonsterSubtextMuted
                )
            }
        }
    }
}
