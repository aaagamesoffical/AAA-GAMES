# CheapPCGames (AAA Games) - Android Application

CheapPCGames is a premier digital gaming store Android application built using **Kotlin**, **Jetpack Compose**, and **Material 3**. It offers instant digital delivery of Steam, Epic Games, PS4, and PS5 games, accounts, and CD keys with 100% lifetime warranty and 24/7 WhatsApp support.

## Key Features

- **Multi-Platform Digital Catalog**: Steam, Epic Games, PlayStation 4, and PlayStation 5 games.
- **Flash Deals of the Day**: Dedicated carousel for massive discounts up to 90% off.
- **Search & Filter Engine**: Instant search by title or platform, genre filtering (Action, Open World, RPG, Sports, etc.), and multi-criteria sorting (Featured, Price, Rating, Discount).
- **Game Detail View**: Comprehensive details including editions, instant delivery guarantees, lifetime warranty indicators, customer reviews, detailed activation guides, and minimum/recommended system specs.
- **Shopping Cart & Checkout**: Real-time quantity adjustment, coupon code validation (`AAA10`, `MEGA20`), instant order generation with simulated secure UPI payments.
- **My Digital Orders**: Instant delivery vault storing digital CD keys and offline account credentials with one-tap copy functionality.
- **Wishlist**: Quick-save favorite games to track flash sales and price drops.
- **Game Advisor AI**: Intelligent in-app recommendation assistant suggesting games tailored to user budgets and genre preferences.
- **Verified Reviews & FAQ**: Customer reviews and comprehensive FAQ explaining offline modes, warranty policies, and console sharing.

## Tech Stack & Architecture

- **Language**: Kotlin 2.0.21
- **UI Framework**: Jetpack Compose with Material Design 3 (M3)
- **Architecture**: MVVM with unidirectional data flow (`StoreViewModel` + `StateFlow`)
- **Image Loading**: Coil Compose with network caching
- **Serialization**: Kotlinx Serialization JSON
- **Build System**: Gradle Kotlin DSL (`settings.gradle.kts`, `build.gradle.kts`, `libs.versions.toml`)
- **Application ID**: `com.aistudio.aaagames.qvzrx`
