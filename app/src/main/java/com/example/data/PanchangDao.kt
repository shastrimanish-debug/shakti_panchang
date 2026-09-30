package com.example.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PanchangDao {
    @Query("SELECT * FROM user_notes ORDER BY timestamp DESC")
    fun getAllNotes(): Flow<List<UserNoteEntity>>

    @Query("SELECT * FROM user_notes WHERE dateString = :dateStr")
    fun getNotesForDate(dateStr: String): Flow<List<UserNoteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: UserNoteEntity)

    @Delete
    suspend fun deleteNote(note: UserNoteEntity)

    @Query("SELECT * FROM favorite_mantras")
    fun getFavoriteMantras(): Flow<List<FavoriteMantraEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(favorite: FavoriteMantraEntity)

    @Query("DELETE FROM favorite_mantras WHERE mantraId = :mantraId")
    suspend fun removeFavorite(mantraId: String)
}

@Database(entities = [UserNoteEntity::class, FavoriteMantraEntity::class], version = 1, exportSchema = false)
abstract class PanchangDatabase : RoomDatabase() {
    abstract fun panchangDao(): PanchangDao

    companion object {
        @Volatile
        private var INSTANCE: PanchangDatabase? = null

        fun getDatabase(context: android.content.Context): PanchangDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    PanchangDatabase::class.java,
                    "shakti_panchang_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
