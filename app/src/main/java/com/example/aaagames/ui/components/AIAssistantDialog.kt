package com.example.aaagames.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.aaagames.model.Game
import com.example.aaagames.ui.theme.DarkBackground
import com.example.aaagames.ui.theme.DarkSurface
import com.example.aaagames.ui.theme.DarkSurfaceVariant
import com.example.aaagames.ui.theme.EmeraldPrimary
import com.example.aaagames.ui.theme.TextMuted
import com.example.aaagames.ui.theme.TextPrimary
import com.example.aaagames.ui.theme.TextSecondary

data class ChatMessage(
    val sender: String, // "ai" or "user"
    val text: String,
    val recommendedGames: List<Game> = emptyList()
)

@Composable
fun AIAssistantDialog(
    isOpen: Boolean,
    allGames: List<Game>,
    onDismiss: () -> Unit,
    onSelectGame: (Game) -> Unit
) {
    if (!isOpen) return

    var inputText by remember { mutableStateOf("") }
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessage(
                    sender = "ai",
                    text = "Hello! I am your AAA Games AI Store Assistant. Tell me your preferred platform, genre, or budget (e.g. 'Under ₹400', 'Best open-world', or 'PS5 hits').",
                    recommendedGames = allGames.filter { it.isDealOfTheDay }.take(2)
                )
            )
        )
    }

    val handleSend: (String) -> Unit = { query ->
        val userQuery = query.trim()
        if (userQuery.isNotBlank()) {
            val userMsg = ChatMessage(sender = "user", text = userQuery)
            val lower = userQuery.lowercase()

            val matchingGames = allGames.filter { game ->
                when {
                    "under 300" in lower || "cheap" in lower || "budget" in lower -> game.price <= 350
                    "under 500" in lower -> game.price <= 500
                    "ps5" in lower -> game.platform == com.example.aaagames.model.Platform.PS5
                    "steam" in lower -> game.platform == com.example.aaagames.model.Platform.STEAM
                    "rpg" in lower || "souls" in lower -> game.genre.contains("RPG", ignoreCase = true)
                    "open world" in lower -> game.genre.contains("Open World", ignoreCase = true)
                    "story" in lower || "action" in lower -> game.genre.contains("Action", ignoreCase = true)
                    else -> game.title.contains(userQuery, ignoreCase = true) || game.genre.contains(userQuery, ignoreCase = true)
                }
            }.take(3)

            val aiResponseText = if (matchingGames.isNotEmpty()) {
                "Here are my top recommendations matching '$userQuery':"
            } else {
                "I couldn't find exact matches for '$userQuery', but here are our top-rated bestsellers available right now:"
            }

            val aiMsg = ChatMessage(
                sender = "ai",
                text = aiResponseText,
                recommendedGames = if (matchingGames.isNotEmpty()) matchingGames else allGames.take(3)
            )

            messages = messages + userMsg + aiMsg
            inputText = ""
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(520.dp),
            colors = CardDefaults.cardColors(containerColor = DarkBackground),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = EmeraldPrimary,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = "AI",
                                    tint = Color.Black,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Game Advisor AI",
                                color = TextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Black
                            )
                            Text(
                                text = "Instant Game Recommendations",
                                color = TextMuted,
                                fontSize = 10.sp
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Quick Prompts Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    QuickChip("Under ₹400") { handleSend("Games under 400") }
                    QuickChip("Best RPGs") { handleSend("Best RPG") }
                    QuickChip("PS5 Deluxe") { handleSend("PS5") }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Messages Scroll
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    messages.forEach { msg ->
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = if (msg.sender == "user") Alignment.End else Alignment.Start
                        ) {
                            Surface(
                                color = if (msg.sender == "user") EmeraldPrimary else DarkSurface,
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    text = msg.text,
                                    color = if (msg.sender == "user") Color.Black else TextPrimary,
                                    fontSize = 12.sp,
                                    lineHeight = 17.sp,
                                    fontWeight = if (msg.sender == "user") FontWeight.Bold else FontWeight.Normal,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }

                            if (msg.recommendedGames.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    msg.recommendedGames.forEach { g ->
                                        Card(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clickable {
                                                    onSelectGame(g)
                                                    onDismiss()
                                                },
                                            colors = CardDefaults.cardColors(containerColor = DarkSurfaceVariant),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(8.dp),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Column(modifier = Modifier.weight(1f)) {
                                                    Text(
                                                        text = g.title,
                                                        color = TextPrimary,
                                                        fontSize = 12.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        maxLines = 1
                                                    )
                                                    Text(
                                                        text = "${g.platform.displayName} • ₹${g.price.toInt()}",
                                                        color = EmeraldPrimary,
                                                        fontSize = 11.sp,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                }
                                                Text(
                                                    text = "View →",
                                                    color = TextSecondary,
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Input Box
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Ask for games, prices, genres…", color = TextMuted, fontSize = 12.sp) },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = DarkSurface,
                            unfocusedContainerColor = DarkSurface,
                            focusedBorderColor = EmeraldPrimary,
                            unfocusedBorderColor = DarkSurfaceVariant,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = { handleSend(inputText) },
                        modifier = Modifier
                            .size(44.dp)
                            .background(EmeraldPrimary, RoundedCornerShape(10.dp))
                    ) {
                        Icon(imageVector = Icons.Default.Send, contentDescription = "Send", tint = Color.Black, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun QuickChip(label: String, onClick: () -> Unit) {
    Surface(
        color = DarkSurfaceVariant,
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.clickable { onClick() }
    ) {
        Text(
            text = label,
            color = TextSecondary,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
