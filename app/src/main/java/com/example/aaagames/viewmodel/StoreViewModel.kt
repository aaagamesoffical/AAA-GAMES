package com.example.aaagames.viewmodel

import androidx.lifecycle.ViewModel
import com.example.aaagames.data.GameRepository
import com.example.aaagames.model.CartItem
import com.example.aaagames.model.Game
import com.example.aaagames.model.Order
import com.example.aaagames.model.OrderItem
import com.example.aaagames.model.Platform
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

enum class SortOption(val label: String) {
    FEATURED("Featured"),
    PRICE_LOW_TO_HIGH("Price: Low to High"),
    PRICE_HIGH_TO_LOW("Price: High to Low"),
    RATING("Top Rated"),
    DISCOUNT("Biggest Discount")
}

data class StoreUiState(
    val games: List<Game> = emptyList(),
    val selectedPlatform: Platform? = null,
    val searchQuery: String = "",
    val selectedGenre: String = "All",
    val sortBy: SortOption = SortOption.FEATURED,
    val inStockOnly: Boolean = false,
    val cart: List<CartItem> = emptyList(),
    val wishlistIds: Set<String> = emptySet(),
    val orders: List<Order> = emptyList(),
    val selectedGame: Game? = null,
    val isCartOpen: Boolean = false,
    val isWishlistOpen: Boolean = false,
    val isOrdersOpen: Boolean = false,
    val isAIAssistantOpen: Boolean = false,
    val lastCreatedOrder: Order? = null,
    val isCheckoutDialogVisible: Boolean = false,
    val appliedCoupon: String? = null,
    val couponDiscountPercent: Int = 0
) {
    val filteredGames: List<Game>
        get() {
            var list = games.filter { game ->
                val platformMatch = selectedPlatform == null || game.platform == selectedPlatform
                val genreMatch = selectedGenre == "All" || game.genre.contains(selectedGenre, ignoreCase = true)
                val searchMatch = searchQuery.isBlank() ||
                        game.title.contains(searchQuery, ignoreCase = true) ||
                        game.genre.contains(searchQuery, ignoreCase = true) ||
                        game.platform.displayName.contains(searchQuery, ignoreCase = true)
                val stockMatch = !inStockOnly || game.inStock

                platformMatch && genreMatch && searchMatch && stockMatch
            }

            return when (sortBy) {
                SortOption.FEATURED -> list.sortedByDescending { it.isFeatured }
                SortOption.PRICE_LOW_TO_HIGH -> list.sortedBy { it.price }
                SortOption.PRICE_HIGH_TO_LOW -> list.sortedByDescending { it.price }
                SortOption.RATING -> list.sortedByDescending { it.rating }
                SortOption.DISCOUNT -> list.sortedByDescending { it.discountPercent }
            }
        }

    val cartTotalOriginal: Double
        get() = cart.sumOf { it.game.originalPrice * it.quantity }

    val cartSubtotal: Double
        get() = cart.sumOf { it.game.price * it.quantity }

    val cartDiscount: Double
        get() = if (couponDiscountPercent > 0) cartSubtotal * (couponDiscountPercent / 100.0) else 0.0

    val cartFinalTotal: Double
        get() = (cartSubtotal - cartDiscount).coerceAtLeast(0.0)

    val cartCount: Int
        get() = cart.sumOf { it.quantity }
}

class StoreViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(
        StoreUiState(
            games = GameRepository.sampleGames,
            wishlistIds = setOf("black-myth-wukong-steam", "gow-ragnarok-ps5")
        )
    )
    val uiState: StateFlow<StoreUiState> = _uiState.asStateFlow()

    fun selectPlatform(platform: Platform?) {
        _uiState.update { it.copy(selectedPlatform = platform) }
    }

    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun selectGenre(genre: String) {
        _uiState.update { it.copy(selectedGenre = genre) }
    }

    fun selectSortOption(sort: SortOption) {
        _uiState.update { it.copy(sortBy = sort) }
    }

    fun toggleInStockFilter() {
        _uiState.update { it.copy(inStockOnly = !it.inStockOnly) }
    }

    fun openGameDetail(game: Game) {
        _uiState.update { it.copy(selectedGame = game) }
    }

    fun closeGameDetail() {
        _uiState.update { it.copy(selectedGame = null) }
    }

    fun openCart() {
        _uiState.update { it.copy(isCartOpen = true) }
    }

    fun closeCart() {
        _uiState.update { it.copy(isCartOpen = false) }
    }

    fun openWishlist() {
        _uiState.update { it.copy(isWishlistOpen = true) }
    }

    fun closeWishlist() {
        _uiState.update { it.copy(isWishlistOpen = false) }
    }

    fun openOrders() {
        _uiState.update { it.copy(isOrdersOpen = true) }
    }

    fun closeOrders() {
        _uiState.update { it.copy(isOrdersOpen = false) }
    }

    fun openAIAssistant() {
        _uiState.update { it.copy(isAIAssistantOpen = true) }
    }

    fun closeAIAssistant() {
        _uiState.update { it.copy(isAIAssistantOpen = false) }
    }

    fun addToCart(game: Game) {
        _uiState.update { state ->
            val existing = state.cart.find { it.game.id == game.id }
            val newCart = if (existing != null) {
                state.cart.map {
                    if (it.game.id == game.id) it.copy(quantity = it.quantity + 1) else it
                }
            } else {
                state.cart + CartItem(game, 1)
            }
            state.copy(cart = newCart)
        }
    }

    fun updateCartQuantity(gameId: String, delta: Int) {
        _uiState.update { state ->
            val updated = state.cart.mapNotNull { item ->
                if (item.game.id == gameId) {
                    val newQty = item.quantity + delta
                    if (newQty > 0) item.copy(quantity = newQty) else null
                } else {
                    item
                }
            }
            state.copy(cart = updated)
        }
    }

    fun removeFromCart(gameId: String) {
        _uiState.update { state ->
            state.copy(cart = state.cart.filter { it.game.id != gameId })
        }
    }

    fun toggleWishlist(gameId: String) {
        _uiState.update { state ->
            val updated = if (state.wishlistIds.contains(gameId)) {
                state.wishlistIds - gameId
            } else {
                state.wishlistIds + gameId
            }
            state.copy(wishlistIds = updated)
        }
    }

    fun applyCoupon(code: String): Boolean {
        val normalized = code.trim().uppercase()
        return if (normalized == "AAA10" || normalized == "WELCOME10") {
            _uiState.update {
                it.copy(
                    appliedCoupon = normalized,
                    couponDiscountPercent = 10
                )
            }
            true
        } else if (normalized == "MEGA20") {
            _uiState.update {
                it.copy(
                    appliedCoupon = normalized,
                    couponDiscountPercent = 20
                )
            }
            true
        } else {
            false
        }
    }

    fun completeCheckout(name: String, phone: String) {
        val state = _uiState.value
        if (state.cart.isEmpty()) return

        val orderItems = state.cart.map { item ->
            val sampleKey = when (item.game.type) {
                com.example.aaagames.model.ProductType.CD_KEY -> "KEY-" + UUID.randomUUID().toString().take(12).uppercase()
                com.example.aaagames.model.ProductType.OFFLINE_ACCOUNT -> "User: aaa_${item.game.platform.name.lowercase()}_${item.game.slug.take(4)} | Pass: StoreGame@2026"
                com.example.aaagames.model.ProductType.FULL_ACCOUNT -> "User: play_${item.game.slug.take(5)}@aaagames.store | Pass: ConsolePsn@99"
            }
            OrderItem(
                gameId = item.game.id,
                title = item.game.title,
                platform = item.game.platform,
                type = item.game.type,
                price = item.game.price,
                deliveryType = item.game.deliveryType,
                digitalKeyOrAccount = sampleKey
            )
        }

        val newOrder = Order(
            id = "ORD-" + System.currentTimeMillis().toString().takeLast(6),
            customerName = name.ifBlank { "Gamer Customer" },
            customerPhone = phone.ifBlank { "+91 98765 43210" },
            items = orderItems,
            totalAmount = state.cartFinalTotal,
            originalAmount = state.cartTotalOriginal,
            discountAmount = state.cartTotalOriginal - state.cartFinalTotal,
            appliedCoupon = state.appliedCoupon,
            status = "delivered",
            paymentMethod = "UPI Instant QR",
            paymentId = "UPI-TXN-" + UUID.randomUUID().toString().take(8).uppercase(),
            createdAt = "Just now"
        )

        _uiState.update {
            it.copy(
                orders = listOf(newOrder) + it.orders,
                cart = emptyList(),
                lastCreatedOrder = newOrder,
                isCartOpen = false,
                isCheckoutDialogVisible = true
            )
        }
    }

    fun dismissCheckoutSuccessDialog() {
        _uiState.update { it.copy(isCheckoutDialogVisible = false, lastCreatedOrder = null) }
    }
}
