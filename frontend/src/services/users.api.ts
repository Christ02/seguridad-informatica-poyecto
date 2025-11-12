/**
 * Users API Service
 * Servicios de perfil y configuración de usuario
 */

import { apiService } from './api.service';

export interface UserProfile {
  id: string;
  email: string;
  dpi: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  phoneNumber: string;
  formattedPhone: string;
  department: string | null;
  municipality: string | null;
  address: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  email?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserActivity {
  id: string;
  action: string;
  date: string;
  eventType: string;
  metadata?: Record<string, any>;
}

export const usersApi = {
  /**
   * Obtener perfil del usuario
   */
  getProfile: async (): Promise<{ profile: UserProfile }> => {
    return await apiService.get<{ profile: UserProfile }>('/users/profile');
  },

  /**
   * Actualizar perfil del usuario (solo email, teléfono y dirección)
   */
  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; profile: UserProfile }> => {
    return await apiService.patch<{ message: string; profile: UserProfile }>(
      '/users/profile',
      data
    );
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    return await apiService.patch<{ message: string }>(
      '/users/change-password',
      data
    );
  },

  /**
   * Obtener actividad reciente del usuario
   */
  getActivity: async (): Promise<{ activities: UserActivity[] }> => {
    return await apiService.get<{ activities: UserActivity[] }>('/users/activity');
  },
};
