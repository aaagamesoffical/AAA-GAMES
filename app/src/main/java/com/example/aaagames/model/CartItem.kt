package com.example.aaagames.model

import kotlinx.serialization.Serializable

@Serializable
data class CartItem(
    val game: Game,
    val quantity: Int = 1
)
