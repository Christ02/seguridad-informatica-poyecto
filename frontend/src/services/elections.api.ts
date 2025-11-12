/**
 * Elections API Service
 * Servicios para gestionar elecciones
 */

import { apiService } from './api.service';

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'COMPLETED';
  totalVotes: number;
  isActive: boolean;
  allowMultipleVotes: boolean;
  candidates?: Candidate[];
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  party?: string;
  photoUrl?: string;
  voteCount: number;
  isActive: boolean;
  electionId: string;
}

export interface CreateElectionDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  allowMultipleVotes?: boolean;
}

export interface UpdateElectionDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  allowMultipleVotes?: boolean;
}

export const electionsApi = {
  /**
   * Obtener todas las elecciones
   */
  getAll: async (): Promise<Election[]> => {
    return await apiService.get<Election[]>('/elections');
  },

  /**
   * Obtener elecciones activas
   */
  getActive: async (): Promise<Election[]> => {
    return await apiService.get<Election[]>('/elections/active');
  },

  /**
   * Obtener una elección por ID
   */
  getById: async (id: string): Promise<Election> => {
    return await apiService.get<Election>(`/elections/${id}`);
  },

  /**
   * Crear nueva elección (Solo ADMIN)
   */
  create: async (data: CreateElectionDto): Promise<Election> => {
    return await apiService.post<Election>('/elections', data);
  },

  /**
   * Actualizar elección (Solo ADMIN)
   */
  update: async (id: string, data: UpdateElectionDto): Promise<Election> => {
    return await apiService.patch<Election>(`/elections/${id}`, data);
  },

  /**
   * Actualizar estado de elección (Solo ADMIN)
   */
  updateStatus: async (id: string, status: string): Promise<Election> => {
    return await apiService.patch<Election>(`/elections/${id}/status`, { status });
  },

  /**
   * Eliminar elección (Solo ADMIN)
   */
  delete: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/elections/${id}`);
  },
};

