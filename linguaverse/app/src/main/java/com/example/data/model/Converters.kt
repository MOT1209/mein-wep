package com.example.data.model

import androidx.room.TypeConverter
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

class Converters {
    private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
    private val stringListAdapter = moshi.adapter<List<String>>(
        Types.newParameterizedType(List::class.java, String::class.java)
    )

    @TypeConverter
    fun fromCefrLevel(level: CefrLevel): String = level.name

    @TypeConverter
    fun toCefrLevel(name: String): CefrLevel = try {
        CefrLevel.valueOf(name)
    } catch (e: Exception) {
        CefrLevel.A1
    }

    @TypeConverter
    fun fromExerciseType(type: ExerciseType): String = type.name

    @TypeConverter
    fun toExerciseType(name: String): ExerciseType = try {
        ExerciseType.valueOf(name)
    } catch (e: Exception) {
        ExerciseType.VOCABULARY
    }

    @TypeConverter
    fun fromStringList(list: List<String>): String = stringListAdapter.toJson(list)

    @TypeConverter
    fun toStringList(json: String): List<String> = try {
        stringListAdapter.fromJson(json) ?: emptyList()
    } catch (e: Exception) {
        emptyList()
    }
}
