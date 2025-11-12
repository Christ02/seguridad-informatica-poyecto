/**
 * Candidates API Service
 * Servicios para gestionar candidatos
 */

import { apiService } from './api.service';

export interface Candidate {
  id: string;
  name: string;
  description: string;
  party?: string;
  photoUrl?: string;
  voteCount: number;
  isActive: boolean;
  electionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateResult extends Candidate {
  votes: number;
  percentage: number;
}

export interface CreateCandidateDto {
  name: string;
  description: string;
  party?: string;
  photoUrl?: string;
  electionId: string;
}

export const candidatesApi = {
  /**
   * Obtener candidatos de una elección
   */
  getByElection: async (electionId: string): Promise<Candidate[]> => {
    return await apiService.get<Candidate[]>(`/candidates/election/${electionId}`);
  },

  /**
   * Obtener candidato por ID
   */
  getById: async (id: string): Promise<Candidate> => {
    return await apiService.get<Candidate>(`/candidates/${id}`);
  },

  /**
   * Crear candidato (Solo ADMIN)
   */
  create: async (data: CreateCandidateDto): Promise<Candidate> => {
    return await apiService.post<Candidate>('/candidates', data);
  },

  /**
   * Obtener resultados de una elección
   */
  getResults: async (electionId: string): Promise<CandidateResult[]> => {
    return await apiService.get<CandidateResult[]>(`/candidates/election/${electionId}/results`);
  },
};

