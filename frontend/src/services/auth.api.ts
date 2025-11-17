/**
 * Auth API Service
 * Servicios de autenticación que conectan con el backend
 */

import { apiService } from './api.service';

export interface LoginCredentials {
  identifier: string; // Email o número de identificación
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  dpi: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  department?: string;
  municipality?: string;
  address?: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    mfaEnabled: boolean;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dpi: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return await apiService.post<LoginResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    return await apiService.post<RegisterResponse>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    return await apiService.post('/auth/logout');
  },

  refreshToken: async (): Promise<LoginResponse> => {
    // El refresh token se maneja automáticamente por el apiService con cookies httpOnly
    return await apiService.post<LoginResponse>('/auth/refresh', {});
  },

  getProfile: async (): Promise<LoginResponse['user']> => {
    return await apiService.get<LoginResponse['user']>('/auth/me');
  },
};

