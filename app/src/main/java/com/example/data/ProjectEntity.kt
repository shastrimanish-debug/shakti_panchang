package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "projects")
data class ProjectEntity(
  @PrimaryKey(autoGenerate = true)
  val id: Long = 0L,
  val name: String,
  val lastEdited: Long = System.currentTimeMillis(),
  val durationMs: Long = 0L,
  val resolution: String = "1080p",
  val aspectRatio: String = "16:9",
  val clipCount: Int = 1,
  val thumbnailUri: String? = null,
  val videoUri: String? = null
)
