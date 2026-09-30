package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_notes")
data class UserNoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val dateString: String,
    val title: String,
    val content: String,
    val isVratReminder: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "favorite_mantras")
data class FavoriteMantraEntity(
    @PrimaryKey val mantraId: String,
    val title: String
)
