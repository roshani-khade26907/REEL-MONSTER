package com.reelmonster.overlay

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.reelmonster.dialogue.MonsterMood

@Composable
fun MonsterBubble(
    count: Int,
    mood: MonsterMood,
    speechText: String?,
    showPlusOne: Boolean,
    onTap: () -> Unit,
    onDismissSpeech: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Subtle breathing bounce
    val infiniteTransition = rememberInfiniteTransition(label = "monster_breath")
    val bounceY by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = if (mood == MonsterMood.HAPPY) -6f else -3f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "bounce"
    )

    // Eye blink animation
    val eyeBlink by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0.1f,
        animationSpec = infiniteRepeatable(
            animation = keyframes {
                durationMillis = 3200
                1f at 0
                1f at 2800
                0.1f at 2950
                1f at 3100
            },
            repeatMode = RepeatMode.Restart
        ),
        label = "blink"
    )

    val currentScale = mood.scaleFactor

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .padding(8.dp)
            .widthIn(max = 240.dp)
    ) {
        // Speech Bubble
        AnimatedVisibility(
            visible = !speechText.isNullOrBlank(),
            enter = fadeIn() + scaleIn(),
            exit = fadeOut() + scaleOut()
        ) {
            Box(
                modifier = Modifier
                    .padding(bottom = 6.dp)
                    .shadow(4.dp, RoundedCornerShape(16.dp))
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White)
                    .clickable { onDismissSpeech() }
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text(
                    text = speechText.orEmpty(),
                    color = Color(0xFF0F172A),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    lineHeight = 14.sp
                )
            }
        }

        // Floating +1 Indicator
        AnimatedVisibility(
            visible = showPlusOne,
            enter = fadeIn() + scaleIn(),
            exit = fadeOut()
        ) {
            Text(
                text = "+1",
                color = Color(0xFFFACC15),
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                modifier = Modifier
                    .shadow(6.dp, CircleShape)
                    .background(Color(0xFF0F172A), CircleShape)
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            )
        }

        // Monster Character Body
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .offset(y = bounceY.dp)
                .scale(currentScale)
                .size(72.dp)
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .shadow(8.dp, CircleShape)
            ) {
                drawMonsterCharacter(mood, eyeBlink)
            }

            // Real-time Badge Count
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .offset(x = 2.dp, y = 2.dp)
                    .shadow(4.dp, CircleShape)
                    .clip(CircleShape)
                    .background(Color(0xFF0F172A))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = count.toString(),
                    color = Color(0xFFFACC15),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

private fun DrawScope.drawMonsterCharacter(mood: MonsterMood, eyeBlink: Float) {
    val center = Offset(size.width / 2f, size.height / 2f)
    val radius = size.width / 2f * 0.92f

    // Soft gradient magenta/pink body
    val bodyBrush = Brush.radialGradient(
        colors = listOf(
            Color(0xFFFF529A),
            Color(0xFFFF1493),
            Color(0xFFC71585)
        ),
        center = Offset(center.x - 6f, center.y - 8f),
        radius = radius * 1.2f
    )
    drawCircle(brush = bodyBrush, radius = radius, center = center)

    // Highlight rim
    drawCircle(
        color = Color(0x33FFFFFF),
        radius = radius - 3f,
        center = Offset(center.x, center.y - 3f),
        style = Stroke(width = 4f)
    )

    // Cute monster horns / ears
    val leftHorn = Path().apply {
        moveTo(center.x - radius * 0.6f, center.y - radius * 0.6f)
        quadraticBezierTo(
            center.x - radius * 0.9f, center.y - radius * 1.15f,
            center.x - radius * 0.35f, center.y - radius * 0.85f
        )
        close()
    }
    drawPath(leftHorn, Color(0xFFFFD166))

    val rightHorn = Path().apply {
        moveTo(center.x + radius * 0.6f, center.y - radius * 0.6f)
        quadraticBezierTo(
            center.x + radius * 0.9f, center.y - radius * 1.15f,
            center.x + radius * 0.35f, center.y - radius * 0.85f
        )
        close()
    }
    drawPath(rightHorn, Color(0xFFFFD166))

    // Cheerful rosy cheeks
    val blushColor = Color(0x66FF69B4)
    drawCircle(blushColor, radius = 7f, center = Offset(center.x - radius * 0.52f, center.y + 4f))
    drawCircle(blushColor, radius = 7f, center = Offset(center.x + radius * 0.52f, center.y + 4f))

    // Eyes based on Mood
    val eyeY = center.y - 5f
    val eyeSpacing = radius * 0.36f

    when (mood) {
        MonsterMood.HAPPY -> {
            // Big sparkling eyes with highlights
            val eyeH = 12f * eyeBlink
            drawOval(Color.White, Offset(center.x - eyeSpacing - 9f, eyeY - eyeH), Size(18f, eyeH * 2))
            drawOval(Color.White, Offset(center.x + eyeSpacing - 9f, eyeY - eyeH), Size(18f, eyeH * 2))
            drawOval(Color(0xFF0F172A), Offset(center.x - eyeSpacing - 6f, eyeY - eyeH + 3f), Size(12f, eyeH * 1.6f))
            drawOval(Color(0xFF0F172A), Offset(center.x + eyeSpacing - 6f, eyeY - eyeH + 3f), Size(12f, eyeH * 1.6f))
            // Catchlights
            drawCircle(Color.White, 3f, Offset(center.x - eyeSpacing - 2f, eyeY - eyeH + 4f))
            drawCircle(Color.White, 3f, Offset(center.x + eyeSpacing - 2f, eyeY - eyeH + 4f))

            // Happy smile
            val smile = Path().apply {
                moveTo(center.x - 12f, center.y + 10f)
                quadraticBezierTo(center.x, center.y + 20f, center.x + 12f, center.y + 10f)
            }
            drawPath(smile, Color(0xFF0F172A), style = Stroke(width = 4f))
        }
        MonsterMood.CURIOUS -> {
            // One big eye, one slightly smaller, inquisitive smile
            drawCircle(Color.White, 10f, Offset(center.x - eyeSpacing, eyeY - 2f))
            drawCircle(Color.White, 12f, Offset(center.x + eyeSpacing, eyeY))
            drawCircle(Color(0xFF0F172A), 6f, Offset(center.x - eyeSpacing, eyeY - 2f))
            drawCircle(Color(0xFF0F172A), 7f, Offset(center.x + eyeSpacing + 2f, eyeY))
            // Smirk
            val smirk = Path().apply {
                moveTo(center.x - 8f, center.y + 12f)
                quadraticBezierTo(center.x + 4f, center.y + 18f, center.x + 12f, center.y + 9f)
            }
            drawPath(smirk, Color(0xFF0F172A), style = Stroke(width = 4f))
        }
        MonsterMood.SLEEPY -> {
            // Half-closed eyelids, small yawn
            val eyeH = 4f
            drawOval(Color(0xFF0F172A), Offset(center.x - eyeSpacing - 8f, eyeY), Size(16f, eyeH))
            drawOval(Color(0xFF0F172A), Offset(center.x + eyeSpacing - 8f, eyeY), Size(16f, eyeH))
            // Tiny open mouth
            drawCircle(Color(0xFF0F172A), 6f, Offset(center.x, center.y + 14f))
        }
        MonsterMood.TIRED -> {
            // Slanted tired eyes, sweat drop
            val eyePath = Path().apply {
                moveTo(center.x - eyeSpacing - 8f, eyeY - 2f)
                lineTo(center.x - eyeSpacing + 8f, eyeY + 4f)
                moveTo(center.x + eyeSpacing - 8f, eyeY + 4f)
                lineTo(center.x + eyeSpacing + 8f, eyeY - 2f)
            }
            drawPath(eyePath, Color(0xFF0F172A), style = Stroke(width = 4.5f))
            // Blue sweat drop
            drawCircle(Color(0xFF38BDF8), 4f, Offset(center.x - radius * 0.65f, eyeY - 6f))
            // Wavy exhausted mouth
            val wave = Path().apply {
                moveTo(center.x - 10f, center.y + 14f)
                quadraticBezierTo(center.x - 3f, center.y + 10f, center.x, center.y + 14f)
                quadraticBezierTo(center.x + 5f, center.y + 18f, center.x + 10f, center.y + 14f)
            }
            drawPath(wave, Color(0xFF0F172A), style = Stroke(width = 3.5f))
        }
        MonsterMood.EXHAUSTED -> {
            // X eyes, tongue sticking out
            val xSize = 6f
            // Left X
            drawLine(Color(0xFF0F172A), Offset(center.x - eyeSpacing - xSize, eyeY - xSize), Offset(center.x - eyeSpacing + xSize, eyeY + xSize), strokeWidth = 4f)
            drawLine(Color(0xFF0F172A), Offset(center.x - eyeSpacing + xSize, eyeY - xSize), Offset(center.x - eyeSpacing - xSize, eyeY + xSize), strokeWidth = 4f)
            // Right X
            drawLine(Color(0xFF0F172A), Offset(center.x + eyeSpacing - xSize, eyeY - xSize), Offset(center.x + eyeSpacing + xSize, eyeY + xSize), strokeWidth = 4f)
            drawLine(Color(0xFF0F172A), Offset(center.x + eyeSpacing + xSize, eyeY - xSize), Offset(center.x + eyeSpacing - xSize, eyeY + xSize), strokeWidth = 4f)
            // Open mouth with tongue
            drawCircle(Color(0xFF0F172A), 8f, Offset(center.x, center.y + 12f))
            drawOval(Color(0xFFFF69B4), Offset(center.x - 4f, center.y + 14f), Size(8f, 10f))
        }
        MonsterMood.DRAMATIC -> {
            // Comic fiery/sparkle eyes + wide dramatic screaming mouth
            drawCircle(Color(0xFFFACC15), 11f, Offset(center.x - eyeSpacing, eyeY))
            drawCircle(Color(0xFFFACC15), 11f, Offset(center.x + eyeSpacing, eyeY))
            drawCircle(Color(0xFFDC2626), 5f, Offset(center.x - eyeSpacing, eyeY))
            drawCircle(Color(0xFFDC2626), 5f, Offset(center.x + eyeSpacing, eyeY))

            // Screaming open mouth
            val screamMouth = Path().apply {
                moveTo(center.x - 14f, center.y + 8f)
                quadraticBezierTo(center.x, center.y + 26f, center.x + 14f, center.y + 8f)
                close()
            }
            drawPath(screamMouth, Color(0xFF0F172A))
            // Two tiny vampire teeth
            val tooth1 = Path().apply {
                moveTo(center.x - 7f, center.y + 8f)
                lineTo(center.x - 4f, center.y + 13f)
                lineTo(center.x - 1f, center.y + 8f)
                close()
            }
            drawPath(tooth1, Color.White)
            val tooth2 = Path().apply {
                moveTo(center.x + 1f, center.y + 8f)
                lineTo(center.x + 4f, center.y + 13f)
                lineTo(center.x + 7f, center.y + 8f)
                close()
            }
            drawPath(tooth2, Color.White)
        }
    }
}
