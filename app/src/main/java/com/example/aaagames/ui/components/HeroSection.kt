package com.example.aaagames.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aaagames.model.Platform
import com.example.aaagames.ui.theme.CyanAccent
import com.example.aaagames.ui.theme.DarkSurface
import com.example.aaagames.ui.theme.DarkSurfaceVariant
import com.example.aaagames.ui.theme.EmeraldPrimary
import com.example.aaagames.ui.theme.RoseDiscount
import com.example.aaagames.ui.theme.TextPrimary
import com.example.aaagames.ui.theme.TextSecondary

@Composable
fun HeroSection(
    selectedPlatform: Platform?,
    onSelectPlatform: (Platform?) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        // Hero Banner Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = DarkSurface)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF065F46),
                                Color(0xFF064E3B),
                                Color(0xFF0F172A),
                                Color(0xFF09090B)
                            )
                        )
                    )
                    .padding(18.dp)
            ) {
                Column {
                    Surface(
                        color = RoseDiscount,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "⚡ DIGITAL STORE • UP TO 90% OFF",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Cheap PC & Console Games",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        lineHeight = 26.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Instant 24/7 digital delivery of official Steam, Epic Games, PS4, and PS5 accounts & keys with 100% lifetime warranty.",
                        color = TextSecondary,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Trust indicators
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        TrustBadge(icon = Icons.Default.Bolt, title = "Instant Delivery")
                        TrustBadge(icon = Icons.Default.Shield, title = "100% Warranty")
                        TrustBadge(icon = Icons.Default.SupportAgent, title = "24/7 Support")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Platform Filter Chips Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            PlatformChip(
                title = "All Platforms",
                isSelected = selectedPlatform == null,
                onClick = { onSelectPlatform(null) },
                testTag = "platform_chip_all"
            )
            PlatformChip(
                title = "Steam",
                isSelected = selectedPlatform == Platform.STEAM,
                onClick = { onSelectPlatform(Platform.STEAM) },
                testTag = "platform_chip_steam",
                badgeColor = Color(Platform.STEAM.badgeColor)
            )
            PlatformChip(
                title = "Epic Games",
                isSelected = selectedPlatform == Platform.EPIC,
                onClick = { onSelectPlatform(Platform.EPIC) },
                testTag = "platform_chip_epic",
                badgeColor = Color(Platform.EPIC.badgeColor)
            )
            PlatformChip(
                title = "PS5",
                isSelected = selectedPlatform == Platform.PS5,
                onClick = { onSelectPlatform(Platform.PS5) },
                testTag = "platform_chip_ps5",
                badgeColor = Color(Platform.PS5.badgeColor)
            )
            PlatformChip(
                title = "PS4",
                isSelected = selectedPlatform == Platform.PS4,
                onClick = { onSelectPlatform(Platform.PS4) },
                testTag = "platform_chip_ps4",
                badgeColor = Color(Platform.PS4.badgeColor)
            )
        }
    }
}

@Composable
private fun PlatformChip(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    testTag: String,
    badgeColor: Color? = null
) {
    Surface(
        color = if (isSelected) EmeraldPrimary else DarkSurfaceVariant,
        contentColor = if (isSelected) Color.Black else TextPrimary,
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .clickable { onClick() }
            .testTag(testTag)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp)
        ) {
            if (badgeColor != null) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(badgeColor, RoundedCornerShape(4.dp))
                )
                Spacer(modifier = Modifier.width(6.dp))
            }
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Black else FontWeight.SemiBold
            )
        }
    }
}

@Composable
private fun TrustBadge(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String
) {
    Surface(
        color = Color.Black.copy(alpha = 0.4f),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = CyanAccent,
                modifier = Modifier.size(13.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
