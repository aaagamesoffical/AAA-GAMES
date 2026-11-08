package com.example.aaagames

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.example.aaagames.ui.screens.HomeScreen
import com.example.aaagames.ui.theme.AAAGamesTheme
import com.example.aaagames.viewmodel.StoreViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: StoreViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AAAGamesTheme {
                HomeScreen(viewModel = viewModel)
            }
        }
    }
}
