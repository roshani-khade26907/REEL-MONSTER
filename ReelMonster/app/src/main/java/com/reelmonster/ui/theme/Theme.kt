package com.reelmonster.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val MonsterPink = Color(0xFFFF3385)
val MonsterMagenta = Color(0xFFD81B60)
val MonsterBlushBg = Color(0xFFFFF0F5)
val MonsterDarkNavy = Color(0xFF0F172A)
val MonsterYellowAccent = Color(0xFFFACC15)
val MonsterCardWhite = Color(0xFFFFFFFF)
val MonsterTextCharcoal = Color(0xFF1E293B)
val MonsterSubtextMuted = Color(0xFF64748B)
val MonsterBorder = Color(0xFFFCE7F3)

val LightColorScheme = lightColorScheme(
    primary = MonsterPink,
    onPrimary = Color.White,
    primaryContainer = MonsterBlushBg,
    onPrimaryContainer = MonsterDarkNavy,
    secondary = MonsterDarkNavy,
    onSecondary = Color.White,
    tertiary = MonsterYellowAccent,
    background = MonsterBlushBg,
    onBackground = MonsterTextCharcoal,
    surface = MonsterCardWhite,
    onSurface = MonsterTextCharcoal,
    surfaceVariant = Color(0xFFFDF2F8),
    outline = MonsterBorder
)

val Typography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 34.sp,
        color = MonsterDarkNavy
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        lineHeight = 24.sp,
        color = MonsterDarkNavy
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        color = MonsterTextCharcoal
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        color = MonsterSubtextMuted
    )
)
