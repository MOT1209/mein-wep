import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';
import securityUtils from './security-utils';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        // Sanitize user data
        const sanitizedUser = user ? {
          ...user,
          email: securityUtils.sanitizeInput(user.email || ''),
          user_metadata: user.user_metadata ? 
            Object.keys(user.user_metadata).reduce((acc, key) => ({
              ...acc,
              [key]: securityUtils.sanitizeInput(String(user.user_metadata[key]))
            }), {}) : {}
        } : null;
        
        set({ user: sanitizedUser });
      },

      setSession: (session) => {
        set({ session });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error: securityUtils.sanitizeInput(error || '') });
      },

      clearAuth: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        // Handle rehydration
        if (state?.user) {
          state.user = {
            ...state.user,
            email: securityUtils.sanitizeInput(state.user.email || '')
          };
        }
      },
    }
  )
);