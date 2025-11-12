/**
 * Admin API Service
 * Servicios de API para el panel de administración
 */

import { apiService } from './api.service';

export interface DashboardStats {
  totalUsers: number;
  totalElections: number;
  activeElections: number;
  totalVotes: number;
  todayVotes: number;
  recentUsers: number;
  userGrowth: number;
  votesGrowth: number;
}

export interface Activity {
  id: string;
  type: string;
  userEmail: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface VotingTrend {
  date: string;
  votes: number;
}

export interface VoteHistoryItem {
  id: string;
  electionTitle: string;
  candidateName: string;
  voterEmail: string;
  voterName: string;
  voteHash: string;
  isValid: boolean;
  timestamp: string;
}

export interface VoteHistoryResponse {
  data: VoteHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  photoUrl: string;
}

export interface DetailedResults {
  election: {
    id: string;
    title: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  results: {
    totalVotes: number;
    candidates: CandidateResult[];
    winner: CandidateResult | null;
  };
}

export interface Demographics {
  byDepartment: Array<{
    department: string;
    votes: number;
  }>;
  byAge: Array<{
    ageGroup: string;
    votes: number;
  }>;
}

export interface UserItem {
  id: string;
  email: string;
  fullName: string;
  dpi: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UsersResponse {
  data: UserItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  byRole: Array<{
    role: string;
    count: number;
  }>;
}

export interface UserDetails {
  user: UserItem;
  stats: {
    totalVotes: number;
    lastVote: {
      electionTitle: string;
      timestamp: string;
    } | null;
  };
  recentActivity: Array<{
    eventType: string;
    action: string;
    timestamp: string;
    ipAddress: string;
  }>;
}

export interface SecurityStats {
  last24Hours: {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    failureRate: number;
    activeUsers: number;
    suspiciousActivity: number;
  };
  security: {
    mfaEnabled: number;
    mfaAdoptionRate: number;
  };
  trends: {
    loginsByHour: Array<{
      hour: string;
      count: number;
    }>;
  };
  threats: {
    suspiciousIPs: Array<{
      ip: string;
      attempts: number;
    }>;
  };
}

export const adminApi = {
  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await apiService.get<DashboardStats>('/admin/dashboard/stats');
  },

  /**
   * Obtener actividad reciente
   */
  getRecentActivity: async (limit: number = 10): Promise<Activity[]> => {
    return await apiService.get<Activity[]>(`/admin/dashboard/activity?limit=${limit}`);
  },

  /**
   * Obtener tendencias de votación
   */
  getVotingTrends: async (days: number = 7): Promise<VotingTrend[]> => {
    return await apiService.get<VotingTrend[]>(`/admin/dashboard/trends?days=${days}`);
  },

  /**
   * Obtener historial de votos con filtros
   */
  getVotesHistory: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    electionId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<VoteHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.electionId) queryParams.append('electionId', params.electionId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return await apiService.get<VoteHistoryResponse>(
      `/admin/votes/history?${queryParams.toString()}`
    );
  },

  /**
   * Obtener resultados detallados de una elección
   */
  getDetailedResults: async (electionId: string): Promise<DetailedResults> => {
    return await apiService.get<DetailedResults>(`/admin/elections/${electionId}/results`);
  },

  /**
   * Obtener análisis demográfico
   */
  getDemographics: async (electionId: string): Promise<Demographics> => {
    return await apiService.get<Demographics>(`/admin/elections/${electionId}/demographics`);
  },

  /**
   * Obtener usuarios con filtros
   */
  getUsers: async (params: {
    page?: number;
    limit?: number;
    role?: string;
    verified?: boolean;
  }): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());

    return await apiService.get<UsersResponse>(`/admin/users?${queryParams.toString()}`);
  },

  /**
   * Obtener estadísticas de usuarios
   */
  getUserStats: async (): Promise<UserStats> => {
    return await apiService.get<UserStats>('/admin/users/stats');
  },

  /**
   * Obtener detalles de un usuario específico
   */
  getUserDetails: async (userId: string): Promise<UserDetails> => {
    return await apiService.get<UserDetails>(`/admin/users/${userId}`);
  },

  /**
   * Actualizar rol de usuario
   */
  updateUserRole: async (userId: string, role: string): Promise<any> => {
    return await apiService.patch(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Activar/Desactivar usuario
   */
  updateUserStatus: async (userId: string, isActive: boolean): Promise<any> => {
    return await apiService.patch(`/admin/users/${userId}/status`, { isActive });
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (userId: string): Promise<any> => {
    return await apiService.delete(`/admin/users/${userId}`);
  },

  /**
   * Actualizar candidato
   */
  updateCandidate: async (candidateId: string, data: any): Promise<any> => {
    return await apiService.patch(`/admin/candidates/${candidateId}`, data);
  },

  /**
   * Eliminar candidato
   */
  deleteCandidate: async (candidateId: string): Promise<any> => {
    return await apiService.delete(`/admin/candidates/${candidateId}`);
  },

  /**
   * Activar/Desactivar candidato
   */
  toggleCandidateStatus: async (candidateId: string, isActive: boolean): Promise<any> => {
    return await apiService.patch(`/admin/candidates/${candidateId}/status`, { isActive });
  },

  /**
   * Actualizar estado de elección
   */
  updateElectionStatus: async (electionId: string, status: string): Promise<any> => {
    return await apiService.patch(`/admin/elections/${electionId}/status`, { status });
  },

  /**
   * Actualizar elección
   */
  updateElection: async (electionId: string, data: any): Promise<any> => {
    return await apiService.patch(`/admin/elections/${electionId}`, data);
  },

  /**
   * Eliminar elección
   */
  deleteElection: async (electionId: string): Promise<any> => {
    return await apiService.delete(`/admin/elections/${electionId}`);
  },

  /**
   * Exportar resultados CSV
   */
  exportElectionCSV: async (electionId: string): Promise<any> => {
    return await apiService.get(`/admin/elections/${electionId}/export/csv`);
  },

  /**
   * Exportar resultados PDF
   */
  exportElectionPDF: async (electionId: string): Promise<any> => {
    return await apiService.get(`/admin/elections/${electionId}/export/pdf`);
  },

  /**
   * Obtener logs de auditoría
   */
  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    eventType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.eventType) queryParams.append('eventType', params.eventType);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    return await apiService.get(`/admin/audit-logs?${queryParams.toString()}`);
  },

  /**
   * Obtener estadísticas de seguridad
   */
  getSecurityStats: async (): Promise<SecurityStats> => {
    return await apiService.get<SecurityStats>('/admin/security/stats');
  },
};

