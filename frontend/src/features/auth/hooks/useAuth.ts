/**
 * useAuth Hook
 * Hook personalizado para gestión de autenticación
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiService } from '@services/api.service';
import type { LoginCredentials, User, AuthTokens } from '@types/index';

export function useAuth() {
  const { user, setUser, clearUser, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const currentUser = await apiService.get<User>('/auth/me');
      setUser(currentUser);
    } catch {
      clearUser();
    }
  }, [setUser, clearUser]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{success: boolean; requiresMFA?: boolean}> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.post<{
          user?: User;
          tokens?: AuthTokens;
          requiresMFA?: boolean;
        }>('/auth/login', credentials);

        if (response.requiresMFA) {
          return { success: false, requiresMFA: true };
        }

        if (response.user) {
          setUser(response.user);
          return { success: true };
        }

        return { success: false };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearUser();
      setIsLoading(false);
    }
  }, [clearUser]);

  const register = useCallback(
    async (email: string, password: string): Promise<{ success: boolean }> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiService.post('/auth/register', { email, password });
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    checkAuthStatus,
  };
}

