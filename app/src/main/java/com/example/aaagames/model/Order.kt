package com.example.aaagames.model

import kotlinx.serialization.Serializable

@Serializable
data class OrderItem(
    val gameId: String,
    val title: String,
    val platform: Platform,
    val type: ProductType,
    val price: Double,
    val deliveryType: String,
    val digitalKeyOrAccount: String
)

@Serializable
data class Order(
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val originalAmount: Double,
    val discountAmount: Double,
    val appliedCoupon: String? = null,
    val status: String = "delivered", // paid, delivered, processing
    val paymentMethod: String = "UPI Instant",
    val paymentId: String,
    val createdAt: String
)
