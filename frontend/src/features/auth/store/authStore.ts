/**
 * Auth Store
 * Estado global de autenticación con Zustand
 */

import { create } from 'zustand';
import type { User } from '@types/index';

// Import para poder usar desde otros módulos
import { useAuthStore as store } from './authStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionExpiresAt: number | null;
  lastActivity: number;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateLastActivity: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  sessionExpiresAt: null,
  lastActivity: Date.now(),

  setUser: (user) => {
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos
    set({
      user,
      isAuthenticated: true,
      sessionExpiresAt: expiresAt,
      lastActivity: Date.now(),
    });
  },

  clearUser: () => {
    // Memory scrubbing - limpiar datos sensibles
    set({
      user: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      lastActivity: Date.now(),
    });

    // Limpiar sessionStorage
    sessionStorage.clear();
  },

  updateLastActivity: () => {
    set({ lastActivity: Date.now() });
  },
}));

