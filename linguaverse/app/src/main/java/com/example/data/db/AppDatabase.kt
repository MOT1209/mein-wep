package com.example.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.model.*

@Database(
    entities = [
        Language::class,
        UserProfile::class,
        Lesson::class,
        Exercise::class,
        Vocabulary::class,
        GrammarRule::class,
        Flashcard::class,
        Achievement::class,
        ChatMessage::class
    ],
    version = 2,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun linguaVerseDao(): LinguaVerseDao

    companion object {
        /**
         * v1 -> v2: adds the indices that every list query in the app filters on.
         * Index names must match exactly what Room derives from the @Index
         * annotations, otherwise the schema validation on open will fail.
         */
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_lessons_languageCode` ON `lessons` (`languageCode`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_lessons_languageCode_orderIndex` ON `lessons` (`languageCode`, `orderIndex`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_exercises_lessonId` ON `exercises` (`lessonId`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_vocabularies_languageCode` ON `vocabularies` (`languageCode`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_vocabularies_languageCode_isFavorite` ON `vocabularies` (`languageCode`, `isFavorite`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_grammar_rules_languageCode` ON `grammar_rules` (`languageCode`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_flashcards_languageCode` ON `flashcards` (`languageCode`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_chat_messages_timestamp` ON `chat_messages` (`timestamp`)")
            }
        }

        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "linguaverse_database"
                )
                    // No fallbackToDestructiveMigration: it silently wiped every
                    // user's progress on any schema change. Schema changes must
                    // ship a Migration here instead.
                    .addMigrations(MIGRATION_1_2)
                    .build()
                    .also { INSTANCE = it }
            }
        }
    }
}
