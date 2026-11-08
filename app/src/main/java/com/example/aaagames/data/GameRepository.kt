package com.example.aaagames.data

import com.example.aaagames.model.Game
import com.example.aaagames.model.Platform
import com.example.aaagames.model.ProductType
import com.example.aaagames.model.Review
import com.example.aaagames.model.StoreSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object GameRepository {

    val sampleGames = listOf(
        Game(
            id = "gta-v-steam",
            title = "Grand Theft Auto V: Premium Edition",
            slug = "gta-v-premium-edition",
            platform = Platform.STEAM,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Action / Open World",
            price = 299.0,
            originalPrice = 2499.0,
            discountPercent = 88,
            description = "Experience the acclaimed open world game by Rockstar Games. Includes the complete Grand Theft Auto V story experience, free access to GTA Online, and gameplay upgrades.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg",
            steamAppId = 271590,
            edition = "Premium Edition",
            deliveryType = "Instant Steam Offline Account + Login Guide",
            activationGuide = "1. Open Steam client.\n2. Login with provided username & password.\n3. Download GTA V from Library.\n4. Switch Steam to Offline Mode & enjoy unrestricted story mode!",
            systemRequirements = "OS: Windows 10 64-bit | CPU: Intel Core i5 / AMD FX-8350 | RAM: 8 GB | GPU: GTX 660 2GB | Storage: 110 GB",
            inStock = true,
            stockCount = 45,
            isFeatured = true,
            isDealOfTheDay = true,
            rating = 4.9,
            reviewCount = 382
        ),
        Game(
            id = "black-myth-wukong-steam",
            title = "Black Myth: Wukong",
            slug = "black-myth-wukong",
            platform = Platform.STEAM,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Action RPG / Souls-like",
            price = 599.0,
            originalPrice = 3999.0,
            discountPercent = 85,
            description = "Black Myth: Wukong is an action RPG rooted in Chinese mythology. Venture as the Destined One into challenges and marvels ahead with staff combat and transformations.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/2358720/library_hero.jpg",
            steamAppId = 2358720,
            edition = "Standard Edition",
            deliveryType = "Instant Steam Account + 1-Click Setup Guide",
            activationGuide = "1. Launch Steam & login.\n2. Download from official high-speed CDN.\n3. Run shader compilation.\n4. Set Steam -> Go Offline & play!",
            systemRequirements = "OS: Windows 10/11 | CPU: Core i5-8400 / Ryzen 5 1600 | RAM: 16 GB | GPU: GTX 1060 6GB | SSD: 130 GB",
            inStock = true,
            stockCount = 28,
            isFeatured = true,
            isDealOfTheDay = true,
            rating = 4.9,
            reviewCount = 512
        ),
        Game(
            id = "gow-ragnarok-ps5",
            title = "God of War Ragnarök",
            slug = "god-of-war-ragnarok-ps5",
            platform = Platform.PS5,
            type = ProductType.FULL_ACCOUNT,
            genre = "Action / Adventure",
            price = 899.0,
            originalPrice = 4999.0,
            discountPercent = 82,
            description = "Embark on an epic journey as Kratos and Atreus struggle with holding on and letting go. Harness the Leviathan Axe and Blades of Chaos in stunning 4K 60FPS.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/2322010/library_hero.jpg",
            steamAppId = 2322010,
            edition = "PS5 Digital Deluxe Edition",
            deliveryType = "PS5 Console Account (Play on your personal profile)",
            activationGuide = "1. PS5 -> Add New User -> Log in with provided PSN ID.\n2. Settings -> Console Sharing and Offline Play -> Enable.\n3. Download game, switch to your personal PSN ID and enjoy!",
            systemRequirements = "PlayStation 5 Console | Storage: 84 GB SSD | DualSense Haptics supported",
            inStock = true,
            stockCount = 19,
            isFeatured = true,
            isDealOfTheDay = false,
            rating = 5.0,
            reviewCount = 290
        ),
        Game(
            id = "rdr2-steam",
            title = "Red Dead Redemption 2: Ultimate Edition",
            slug = "red-dead-redemption-2-ultimate",
            platform = Platform.STEAM,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Western / Open World",
            price = 349.0,
            originalPrice = 3199.0,
            discountPercent = 89,
            description = "Winner of over 175 Game of the Year Awards, RDR2 is an epic tale of honor and loyalty at the dawn of the modern age. Features breathtaking landscapes and deep roleplay.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1174180/library_hero.jpg",
            steamAppId = 1174180,
            edition = "Ultimate Edition",
            deliveryType = "Steam Offline Account + Instant Activation",
            activationGuide = "1. Log into Steam with credentials.\n2. Download game.\n3. Run once, switch to offline mode and immerse in Arthur Morgan's story.",
            systemRequirements = "OS: Windows 10 | CPU: Intel Core i7-4770K | RAM: 12 GB | GPU: GTX 1060 6GB | Storage: 150 GB",
            inStock = true,
            stockCount = 34,
            isFeatured = true,
            isDealOfTheDay = true,
            rating = 5.0,
            reviewCount = 640
        ),
        Game(
            id = "cyberpunk-2077-steam",
            title = "Cyberpunk 2077: Phantom Liberty Bundle",
            slug = "cyberpunk-2077-phantom-liberty",
            platform = Platform.STEAM,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Sci-Fi / Open World RPG",
            price = 499.0,
            originalPrice = 3599.0,
            discountPercent = 86,
            description = "Cyberpunk 2077 is an open-world action-adventure RPG set in Night City. Includes the acclaimed spy-thriller expansion Phantom Liberty starring Idris Elba.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg",
            steamAppId = 1091500,
            edition = "Ultimate Edition (Base + DLC)",
            deliveryType = "Instant Steam Account",
            activationGuide = "1. Sign into Steam.\n2. Install Cyberpunk 2077 + DLC.\n3. Switch Steam to Offline mode and launch.",
            systemRequirements = "OS: Windows 10 64-bit | CPU: Core i7-6700 | RAM: 12 GB | GPU: RTX 2060 / RX 5700 XT | SSD: 70 GB",
            inStock = true,
            stockCount = 22,
            isFeatured = true,
            isDealOfTheDay = false,
            rating = 4.8,
            reviewCount = 420
        ),
        Game(
            id = "fc-25-steam",
            title = "EA SPORTS FC 25",
            slug = "ea-sports-fc-25",
            platform = Platform.STEAM,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Sports / Football",
            price = 549.0,
            originalPrice = 4499.0,
            discountPercent = 88,
            description = "EA SPORTS FC 25 gives you more ways to win for the club. Team up in 5v5 Rush, enjoy FC IQ tactical overhauls, and lead your squad across Career modes.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/2669320/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/2669320/library_hero.jpg",
            steamAppId = 2669320,
            edition = "Standard Edition",
            deliveryType = "Steam + EA Offline Account",
            activationGuide = "1. Log into Steam with credentials.\n2. Complete initial EA app link and download.\n3. Launch Career Mode in offline mode.",
            systemRequirements = "OS: Windows 10/11 | CPU: Core i5 6600K | RAM: 8 GB | GPU: GTX 1050 Ti | Storage: 100 GB",
            inStock = true,
            stockCount = 15,
            isFeatured = true,
            isDealOfTheDay = true,
            rating = 4.6,
            reviewCount = 195
        ),
        Game(
            id = "spiderman-2-ps5",
            title = "Marvel's Spider-Man 2",
            slug = "spiderman-2-ps5",
            platform = Platform.PS5,
            type = ProductType.FULL_ACCOUNT,
            genre = "Action / Superhero",
            price = 999.0,
            originalPrice = 4999.0,
            discountPercent = 80,
            description = "Peter Parker and Miles Morales return for an exciting new chapter. Swing, jump, and utilize Web Wings to travel across New York while facing Venom and Kraven.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1817070/library_hero.jpg",
            steamAppId = 1817070,
            edition = "Digital Deluxe Edition",
            deliveryType = "PS5 Console Account",
            activationGuide = "1. Add new user on PS5.\n2. Enable Console Sharing.\n3. Download and play on your own profile with full trophy tracking.",
            systemRequirements = "PlayStation 5 Console | Storage: 98 GB SSD",
            inStock = true,
            stockCount = 11,
            isFeatured = true,
            isDealOfTheDay = false,
            rating = 4.9,
            reviewCount = 310
        ),
        Game(
            id = "elden-ring-steam",
            title = "ELDEN RING: Shadow of the Erdtree",
            slug = "elden-ring-shadow-of-erdtree",
            platform = Platform.STEAM,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Action RPG / Souls-like",
            price = 649.0,
            originalPrice = 3999.0,
            discountPercent = 84,
            description = "The Golden Order has been broken. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg",
            steamAppId = 1245620,
            edition = "Deluxe Edition (Base + Erdtree)",
            deliveryType = "Instant Steam Account",
            activationGuide = "1. Launch Steam and log in.\n2. Install Elden Ring.\n3. Go offline and explore the Lands Between without interruptions.",
            systemRequirements = "OS: Windows 10 | CPU: Core i5-8400 | RAM: 12 GB | GPU: GTX 1060 3GB | Storage: 60 GB",
            inStock = true,
            stockCount = 30,
            isFeatured = true,
            isDealOfTheDay = false,
            rating = 5.0,
            reviewCount = 890
        ),
        Game(
            id = "hogwarts-legacy-epic",
            title = "Hogwarts Legacy: Digital Deluxe",
            slug = "hogwarts-legacy-deluxe-epic",
            platform = Platform.EPIC,
            type = ProductType.OFFLINE_ACCOUNT,
            genre = "Action RPG / Open World",
            price = 399.0,
            originalPrice = 3499.0,
            discountPercent = 89,
            description = "Experience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret that threatens to tear the wizarding world apart.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/990080/library_hero.jpg",
            steamAppId = 990080,
            edition = "Deluxe Edition",
            deliveryType = "Epic Games Account + Activation Guide",
            activationGuide = "1. Open Epic Games Launcher.\n2. Login with provided email/pass.\n3. Install game & launch in offline mode.",
            systemRequirements = "OS: Windows 10 | CPU: Intel Core i5-6600 | RAM: 16 GB | GPU: GTX 960 4GB | Storage: 85 GB",
            inStock = true,
            stockCount = 18,
            isFeatured = false,
            isDealOfTheDay = true,
            rating = 4.8,
            reviewCount = 275
        ),
        Game(
            id = "tlou-ps4",
            title = "The Last of Us Remastered",
            slug = "the-last-of-us-ps4",
            platform = Platform.PS4,
            type = ProductType.FULL_ACCOUNT,
            genre = "Action / Survival Horror",
            price = 249.0,
            originalPrice = 1999.0,
            discountPercent = 88,
            description = "Winner of over 200 Game of the Year awards, survive a brutal post-pandemic journey across America with Joel and Ellie.",
            coverImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900_2x.jpg",
            bannerImage = "https://shared.steamstatic.com/store_item_assets/steam/apps/1888930/library_hero.jpg",
            steamAppId = 1888930,
            edition = "PS4 Remastered Edition",
            deliveryType = "PS4 Console Primary Account",
            activationGuide = "1. Add User on PS4.\n2. Activate as Primary PS4.\n3. Download & play on your own account.",
            systemRequirements = "PlayStation 4 Console | 45 GB HDD",
            inStock = true,
            stockCount = 25,
            isFeatured = false,
            isDealOfTheDay = false,
            rating = 4.9,
            reviewCount = 410
        )
    )

    val sampleReviews = listOf(
        Review(
            id = "rev-1",
            gameId = "gta-v-steam",
            gameTitle = "Grand Theft Auto V",
            userName = "Rahul Sharma",
            rating = 5.0,
            comment = "Got the login details within 2 minutes on WhatsApp! GTA V installed smooth and offline mode works flawlessly without any hiccups.",
            date = "Yesterday"
        ),
        Review(
            id = "rev-2",
            gameId = "black-myth-wukong-steam",
            gameTitle = "Black Myth: Wukong",
            userName = "Vikram Reddy",
            rating = 5.0,
            comment = "Unbelievable price for Black Myth! Saved over 3000 rupees. Legit Steam account, fast download speed from CDN. 10/10 recommended!",
            date = "3 days ago"
        ),
        Review(
            id = "rev-3",
            gameId = "gow-ragnarok-ps5",
            gameTitle = "God of War Ragnarök",
            userName = "Arjun Patel",
            rating = 5.0,
            comment = "Activated on my PS5 as primary user, playing on my own personal PSN ID with all trophies unlocking! Best store ever.",
            date = "1 week ago"
        )
    )

    val storeSettings = StoreSettings()

    private val _gamesFlow = MutableStateFlow(sampleGames)
    val gamesFlow: Flow<List<Game>> = _gamesFlow.asStateFlow()

    fun getAllGames(): List<Game> = _gamesFlow.value

    fun getGameById(id: String): Game? = _gamesFlow.value.find { it.id == id }

    fun getDealsOfTheDay(): List<Game> = _gamesFlow.value.filter { it.isDealOfTheDay || it.discountPercent >= 85 }

    fun getGenres(): List<String> {
        val genres = mutableSetOf("All")
        _gamesFlow.value.forEach { game ->
            game.genre.split("/").forEach { genres.add(it.trim()) }
        }
        return genres.toList()
    }
}
