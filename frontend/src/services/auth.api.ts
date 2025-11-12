/**
 * Auth API Service
 * Servicios de autenticación que conectan con el backend
 */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
    );
    return response.data;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data,
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );
    return response.data;
  },

  getProfile: async (): Promise<LoginResponse['user']> => {
    const response = await apiClient.get<LoginResponse['user']>('/auth/me');
    return response.data;
  },
};

