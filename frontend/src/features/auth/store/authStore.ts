/**
 * Auth Store
 * Estado global de autenticación con Zustand
 */

import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  sessionExpiresAt: number | null;
  lastActivity: number;
  setUser: (user: User, accessToken: string, refreshToken: string) => void;
  clearUser: () => void;
  updateLastActivity: () => void;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  sessionExpiresAt: null,
  lastActivity: Date.now(),

  setUser: (user, accessToken, refreshToken) => {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos
    
    // Guardar tokens en sessionStorage
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      sessionExpiresAt: expiresAt,
      lastActivity: Date.now(),
    });
  },

  clearUser: () => {
    // Memory scrubbing - limpiar datos sensibles
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      lastActivity: Date.now(),
    });

    // Limpiar sessionStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  },

  updateLastActivity: () => {
    set({ lastActivity: Date.now() });
  },

  getAccessToken: () => {
    const state = get();
    return state.accessToken || sessionStorage.getItem('accessToken');
  },
}));

