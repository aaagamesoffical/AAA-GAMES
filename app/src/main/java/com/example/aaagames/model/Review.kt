package com.example.aaagames.model

import kotlinx.serialization.Serializable

@Serializable
data class Review(
    val id: String,
    val gameId: String,
    val gameTitle: String,
    val userName: String,
    val rating: Double,
    val comment: String,
    val verifiedPurchase: Boolean = true,
    val date: String
)

@Serializable
data class StoreSettings(
    val storeName: String = "AAA Games Store",
    val storeTagline: String = "Instant Digital Keys, Accounts & Flash Deals",
    val announcementText: String = "🔥 SPECIAL DEAL: Up to 90% OFF on Steam & PS5 Digital Games! Instant Delivery 24/7.",
    val whatsappNumber: String = "+919876543210",
    val upiId: String = "aaagames@okhdfcbank"
)
