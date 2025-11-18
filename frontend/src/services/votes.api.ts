/**
 * Votes API Service
 * Servicios para gestionar votación
 */

import { apiService } from './api.service';
import { hashSHA256 } from '@utils/crypto';

export interface CastVoteDto {
  electionId: string;
  candidateId: string;
  encryptedVote: string;
  voteHash: string;
  signature: string;
}

export interface CastVoteResponse {
  success: boolean;
  voteHash: string;
  verificationCode: string;
}

export interface VoteHistory {
  id: string;
  electionId: string;
  electionTitle: string;
  electionStatus: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  candidateName: string;
  candidateParty: string;
  candidatePhotoUrl: string;
  voteHash: string;
  verificationCode: string;
  votedAt: string;
  isValid: boolean;
  status: 'contabilizado' | 'anulado' | 'emitido';
  signature?: string; // Opcional - firma digital del voto
}

export interface VerifyVoteDto {
  voteHash: string;
  verificationCode: string;
}

export interface VerifyVoteResponse {
  valid: boolean;
  electionTitle: string;
  timestamp: Date;
  voteHash: string;
}

export const votesApi = {
  /**
   * Emitir un voto
   */
  cast: async (data: CastVoteDto): Promise<CastVoteResponse> => {
    return await apiService.post<CastVoteResponse>('/votes/cast', data);
  },

  /**
   * Verificar un voto emitido
   */
  verify: async (data: VerifyVoteDto): Promise<VerifyVoteResponse> => {
    return await apiService.post<VerifyVoteResponse>('/votes/verify', data);
  },

  /**
   * Obtener historial de votos
   */
  getHistory: async (): Promise<VoteHistory[]> => {
    return await apiService.get<VoteHistory[]>('/votes/history');
  },

  /**
   * Verificar si ya votó en una elección
   */
  hasVoted: async (electionId: string): Promise<{ hasVoted: boolean }> => {
    return await apiService.get<{ hasVoted: boolean }>(`/votes/has-voted/${electionId}`);
  },

  /**
   * Obtener estadísticas de votación (ADMIN/AUDITOR)
   */
  getStats: async (electionId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    votesPerHour: number;
  }> => {
    return await apiService.get(`/votes/stats/${electionId}`);
  },

  /**
   * Emitir voto simplificado (genera hash automáticamente)
   */
  castSimple: async (
    electionId: string,
    candidateId: string,
    userId: string,
  ): Promise<CastVoteResponse> => {
    // Crear voto encriptado simple (en producción usar crypto real)
    const voteData = JSON.stringify({ electionId, candidateId, timestamp: Date.now() });
    const encryptedVote = btoa(voteData); // Base64 simple

    // Calcular hash del voto
    const hashData = `${userId}:${electionId}:${candidateId}:${encryptedVote}`;
    const voteHash = await hashSHA256(hashData);

    // Firma simple (en producción usar firma digital real)
    const signature = await hashSHA256(`${voteHash}:${userId}`);

    return await votesApi.cast({
      electionId,
      candidateId,
      encryptedVote,
      voteHash,
      signature,
    });
  },
};

