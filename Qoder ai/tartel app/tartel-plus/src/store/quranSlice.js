import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSurah: null,
  currentAyah: 1,
  bookmarks: [],
  recentRecitations: [],
  favorites: [],
  progress: {
    totalAyahsMemorized: 0,
    sessionsCompleted: 0,
    accuracyRate: 0,
  }
};

export const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    setCurrentSurah: (state, action) => {
      state.currentSurah = action.payload;
    },
    setCurrentAyah: (state, action) => {
      state.currentAyah = action.payload;
    },
    addBookmark: (state, action) => {
      const bookmark = {
        id: Date.now(),
        surah: state.currentSurah,
        ayah: state.currentAyah,
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.bookmarks.push(bookmark);
    },
    removeBookmark: (state, action) => {
      state.bookmarks = state.bookmarks.filter(b => b.id !== action.payload);
    },
    addRecentRecitation: (state, action) => {
      const recitation = {
        id: Date.now(),
        surah: state.currentSurah,
        ayahRange: action.payload.ayahRange,
        accuracy: action.payload.accuracy,
        duration: action.payload.duration,
        timestamp: new Date().toISOString()
      };
      state.recentRecitations.unshift(recitation);
      if (state.recentRecitations.length > 50) {
        state.recentRecitations.pop();
      }
    },
    updateProgress: (state, action) => {
      state.progress = {
        ...state.progress,
        ...action.payload
      };
    },
    incrementSessions: (state) => {
      state.progress.sessionsCompleted += 1;
    }
  },
});

export const { 
  setCurrentSurah, 
  setCurrentAyah, 
  addBookmark, 
  removeBookmark, 
  addRecentRecitation,
  updateProgress,
  incrementSessions
} = quranSlice.actions;

export default quranSlice.reducer;