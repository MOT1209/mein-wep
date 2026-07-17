import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userProfile: {
    name: '',
    email: '',
    level: 'beginner',
    joinDate: new Date().toISOString(),
  },
  settings: {
    language: 'ar',
    theme: 'light',
    notifications: true,
    autoPlaySheikh: true,
    correctionSensitivity: 'medium',
  },
  achievements: [],
  dailyStreak: 0,
  lastActiveDate: new Date().toISOString(),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = {
        ...state.userProfile,
        ...action.payload
      };
    },
    updateSetting: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload
      };
    },
    addAchievement: (state, action) => {
      const achievement = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.achievements.push(achievement);
    },
    updateDailyStreak: (state, action) => {
      const today = new Date().toDateString();
      const lastActive = new Date(state.lastActiveDate).toDateString();
      
      if (today !== lastActive) {
        if (action.payload === 'increment') {
          state.dailyStreak += 1;
        } else if (action.payload === 'reset') {
          state.dailyStreak = 1;
        }
        state.lastActiveDate = new Date().toISOString();
      }
    },
    resetStreak: (state) => {
      state.dailyStreak = 0;
      state.lastActiveDate = new Date().toISOString();
    }
  },
});

export const { 
  setUserProfile, 
  updateSetting, 
  addAchievement, 
  updateDailyStreak,
  resetStreak
} = userSlice.actions;

export default userSlice.reducer;