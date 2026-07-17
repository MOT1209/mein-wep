import { configureStore } from '@reduxjs/toolkit';
import quranReducer from './quranSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    quran: quranReducer,
    user: userReducer,
  },
});

// For JavaScript projects, we don't need TypeScript types
// The store is properly configured and ready to use