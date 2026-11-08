package com.example.aaagames.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Flame
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material.icons.filled.SupportAgent
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aaagames.data.GameRepository
import com.example.aaagames.model.Game
import com.example.aaagames.ui.components.AIAssistantDialog
import com.example.aaagames.ui.components.AppTopBar
import com.example.aaagames.ui.components.CartSheet
import com.example.aaagames.ui.components.CheckoutSuccessDialog
import com.example.aaagames.ui.components.GameCard
import com.example.aaagames.ui.components.GameDetailSheet
import com.example.aaagames.ui.components.HeroSection
import com.example.aaagames.ui.components.OrdersSheet
import com.example.aaagames.ui.components.ReviewsAndFAQSection
import com.example.aaagames.ui.components.TopBanner
import com.example.aaagames.ui.components.WishlistSheet
import com.example.aaagames.ui.theme.DarkBackground
import com.example.aaagames.ui.theme.DarkSurface
import com.example.aaagames.ui.theme.DarkSurfaceVariant
import com.example.aaagames.ui.theme.EmeraldPrimary
import com.example.aaagames.ui.theme.RoseDiscount
import com.example.aaagames.ui.theme.TextMuted
import com.example.aaagames.ui.theme.TextPrimary
import com.example.aaagames.ui.theme.TextSecondary
import com.example.aaagames.viewmodel.SortOption
import com.example.aaagames.viewmodel.StoreViewModel

@Composable
fun HomeScreen(
    viewModel: StoreViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val openWhatsApp: () -> Unit = {
        try {
            val phone = GameRepository.storeSettings.whatsappNumber
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$phone?text=Hello%20AAA%20Games%20Store!%20I%20have%20an%20inquiry%20regarding%20digital%20game%20keys."))
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "WhatsApp Support: ${GameRepository.storeSettings.whatsappNumber}", Toast.LENGTH_LONG).show()
        }
    }

    val genres = remember { GameRepository.getGenres() }
    var isSortMenuOpen by remember { mutableStateOf(false) }

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground),
        containerColor = DarkBackground,
        contentWindowInsets = WindowInsets.safeDrawing,
        topBar = {
            Column {
                TopBanner(
                    announcement = GameRepository.storeSettings.announcementText,
                    onWhatsAppClick = openWhatsApp
                )
                AppTopBar(
                    searchQuery = state.searchQuery,
                    onSearchChange = viewModel::updateSearchQuery,
                    cartCount = state.cartCount,
                    wishlistCount = state.wishlistIds.size,
                    onOpenCart = viewModel::openCart,
                    onOpenWishlist = viewModel::openWishlist,
                    onOpenOrders = viewModel::openOrders,
                    onOpenAIAssistant = viewModel::openAIAssistant
                )
            }
        },
        floatingActionButton = {
            if (state.cartCount > 0) {
                ExtendedFloatingActionButton(
                    onClick = viewModel::openCart,
                    containerColor = EmeraldPrimary,
                    contentColor = Color.Black,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .navigationBarsPadding()
                        .testTag("floating_cart_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Cart",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Cart (${state.cartCount}) • ₹${state.cartFinalTotal.toInt()}",
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp
                    )
                }
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            // Hero Showcase Section
            item {
                HeroSection(
                    selectedPlatform = state.selectedPlatform,
                    onSelectPlatform = viewModel::selectPlatform
                )
            }

            // Flash Deals of the Day (only shown if not actively filtering by query)
            if (state.searchQuery.isBlank() && state.selectedPlatform == null) {
                val deals = state.games.filter { it.isDealOfTheDay || it.discountPercent >= 85 }
                if (deals.isNotEmpty()) {
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Surface(
                                        color = RoseDiscount.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Icon(
                                                imageVector = Icons.Default.LocalFireDepartment,
                                                contentDescription = "Deals",
                                                tint = RoseDiscount,
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(
                                            text = "Flash Deals of the Day",
                                            color = TextPrimary,
                                            fontSize = 17.sp,
                                            fontWeight = FontWeight.Black
                                        )
                                        Text(
                                            text = "Massive savings up to 90% off",
                                            color = TextMuted,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            LazyRow(
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(deals) { dealGame ->
                                    GameCard(
                                        game = dealGame,
                                        isInWishlist = state.wishlistIds.contains(dealGame.id),
                                        isInCart = state.cart.any { it.game.id == dealGame.id },
                                        onCardClick = { viewModel.openGameDetail(dealGame) },
                                        onAddToCart = { viewModel.addToCart(dealGame) },
                                        onToggleWishlist = { viewModel.toggleWishlist(dealGame.id) },
                                        modifier = Modifier.width(260.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Catalog Header & Filters
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "All Games Catalog",
                                color = TextPrimary,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black
                            )
                            Text(
                                text = "${state.filteredGames.size} titles available for instant delivery",
                                color = TextMuted,
                                fontSize = 11.sp
                            )
                        }

                        // Sort Menu Button
                        Box {
                            Surface(
                                color = DarkSurfaceVariant,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { isSortMenuOpen = true }
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Sort,
                                        contentDescription = "Sort",
                                        tint = EmeraldPrimary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = state.sortBy.label,
                                        color = TextPrimary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = isSortMenuOpen,
                                onDismissRequest = { isSortMenuOpen = false },
                                modifier = Modifier.background(DarkSurface)
                            ) {
                                SortOption.values().forEach { option ->
                                    DropdownMenuItem(
                                        text = {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text(
                                                    text = option.label,
                                                    color = if (state.sortBy == option) EmeraldPrimary else TextPrimary,
                                                    fontSize = 12.sp,
                                                    fontWeight = if (state.sortBy == option) FontWeight.Bold else FontWeight.Normal
                                                )
                                                if (state.sortBy == option) {
                                                    Icon(
                                                        imageVector = Icons.Default.Check,
                                                        contentDescription = "Selected",
                                                        tint = EmeraldPrimary,
                                                        modifier = Modifier.size(16.dp)
                                                    )
                                                }
                                            }
                                        },
                                        onClick = {
                                            viewModel.selectSortOption(option)
                                            isSortMenuOpen = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Genres Filter Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        genres.forEach { genre ->
                            val isSelected = state.selectedGenre == genre
                            Surface(
                                color = if (isSelected) EmeraldPrimary else DarkSurface,
                                contentColor = if (isSelected) Color.Black else TextSecondary,
                                shape = RoundedCornerShape(16.dp),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(16.dp))
                                    .clickable { viewModel.selectGenre(genre) }
                            ) {
                                Text(
                                    text = genre,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Black else FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Games Grid List
            if (state.filteredGames.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Not found",
                            tint = TextMuted,
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No games matched your criteria",
                            color = TextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Try clearing filters or search for another title.",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }
            } else {
                items(state.filteredGames) { game ->
                    Box(modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)) {
                        GameCard(
                            game = game,
                            isInWishlist = state.wishlistIds.contains(game.id),
                            isInCart = state.cart.any { it.game.id == game.id },
                            onCardClick = { viewModel.openGameDetail(game) },
                            onAddToCart = { viewModel.addToCart(game) },
                            onToggleWishlist = { viewModel.toggleWishlist(game.id) }
                        )
                    }
                }
            }

            // Reviews & FAQs
            item {
                ReviewsAndFAQSection(reviews = GameRepository.sampleReviews)
            }
        }
    }

    // Modals / Sheets
    GameDetailSheet(
        game = state.selectedGame,
        isInWishlist = state.selectedGame?.let { state.wishlistIds.contains(it.id) } ?: false,
        isInCart = state.selectedGame?.let { g -> state.cart.any { it.game.id == g.id } } ?: false,
        onDismiss = viewModel::closeGameDetail,
        onAddToCart = viewModel::addToCart,
        onToggleWishlist = viewModel::toggleWishlist,
        onInstantBuy = { game ->
            viewModel.addToCart(game)
            viewModel.closeGameDetail()
            viewModel.openCart()
        }
    )

    CartSheet(
        isOpen = state.isCartOpen,
        cartItems = state.cart,
        subtotal = state.cartSubtotal,
        originalTotal = state.cartTotalOriginal,
        discountAmount = state.cartDiscount,
        finalTotal = state.cartFinalTotal,
        appliedCoupon = state.appliedCoupon,
        onDismiss = viewModel::closeCart,
        onQuantityChange = viewModel::updateCartQuantity,
        onRemoveItem = viewModel::removeFromCart,
        onApplyCoupon = viewModel::applyCoupon,
        onCheckout = { name, phone ->
            viewModel.completeCheckout(name, phone)
        }
    )

    OrdersSheet(
        isOpen = state.isOrdersOpen,
        orders = state.orders,
        onDismiss = viewModel::closeOrders
    )

    WishlistSheet(
        isOpen = state.isWishlistOpen,
        wishlistGames = state.games.filter { state.wishlistIds.contains(it.id) },
        onDismiss = viewModel::closeWishlist,
        onAddToCart = { game ->
            viewModel.addToCart(game)
            viewModel.toggleWishlist(game.id)
        },
        onRemoveFromWishlist = viewModel::toggleWishlist
    )

    AIAssistantDialog(
        isOpen = state.isAIAssistantOpen,
        allGames = state.games,
        onDismiss = viewModel::closeAIAssistant,
        onSelectGame = { game ->
            viewModel.openGameDetail(game)
        }
    )

    CheckoutSuccessDialog(
        order = state.lastCreatedOrder,
        onDismiss = viewModel::dismissCheckoutSuccessDialog,
        onViewOrders = {
            viewModel.openOrders()
        }
    )
}
