/**
 * useAuth Hook
 * Hook personalizado para gestión de autenticación
 */

import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '@services/auth.api';
import type { LoginCredentials } from '@services/auth.api';
import type { User } from '@/types';
import { apiService } from '@services/api.service';
import { logger } from '@utils/logger';

export function useAuth() {
  const { user, setUser, clearUser, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{
      success: boolean; 
      requiresMFA?: boolean;
      user?: User;
      accessToken?: string;
      refreshToken?: string;
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(credentials);

        if (response.user && response.accessToken && response.refreshToken) {
          setUser(response.user as User, response.accessToken, response.refreshToken);
          return { 
            success: true, 
            user: response.user as User,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken
          };
        }

        return { success: false };
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Login failed';
        setError(errorMessage);
        throw err;
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
      logger.info('User logged out');
    } catch (err) {
      logger.error('Logout error', err);
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
  };
}

