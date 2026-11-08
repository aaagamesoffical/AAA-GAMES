package com.example.aaagames.model

import kotlinx.serialization.Serializable

@Serializable
enum class Platform(val displayName: String, val badgeColor: Long) {
    STEAM("Steam", 0xFF0284C7),
    EPIC("Epic Games", 0xFF14B8A6),
    PS4("PS4", 0xFF2563EB),
    PS5("PS5", 0xFF7C3AED);

    companion object {
        fun fromString(value: String): Platform {
            return when (value.lowercase()) {
                "steam" -> STEAM
                "epic" -> EPIC
                "ps4" -> PS4
                "ps5" -> PS5
                else -> STEAM
            }
        }
    }
}

@Serializable
enum class ProductType(val label: String) {
    CD_KEY("Digital CD Key"),
    OFFLINE_ACCOUNT("Offline Steam/Epic Account"),
    FULL_ACCOUNT("Full Console/PC Account");

    companion object {
        fun fromString(value: String): ProductType {
            return when (value.lowercase()) {
                "cd_key" -> CD_KEY
                "offline_account" -> OFFLINE_ACCOUNT
                "full_account" -> FULL_ACCOUNT
                else -> OFFLINE_ACCOUNT
            }
        }
    }
}

@Serializable
data class Game(
    val id: String,
    val title: String,
    val slug: String,
    val platform: Platform,
    val type: ProductType,
    val genre: String,
    val price: Double,
    val originalPrice: Double,
    val discountPercent: Int,
    val description: String,
    val coverImage: String,
    val bannerImage: String? = null,
    val steamAppId: Int? = null,
    val edition: String = "Standard Edition",
    val deliveryType: String = "Instant Digital Delivery",
    val activationGuide: String = "1. Launch client.\n2. Enter provided credentials or CD key.\n3. Download & enjoy!",
    val systemRequirements: String? = null,
    val inStock: Boolean = true,
    val stockCount: Int = 10,
    val isFeatured: Boolean = false,
    val isDealOfTheDay: Boolean = false,
    val rating: Double = 4.8,
    val reviewCount: Int = 120
)
