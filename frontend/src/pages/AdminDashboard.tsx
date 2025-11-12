/**
 * AdminDashboard Component
 * Dashboard principal del administrador con estadísticas en tiempo real
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@components/AdminLayout';
import { useAuthStore } from '@features/auth/store/authStore';
import { adminApi } from '@services/admin.api';
import type { DashboardStats, Activity, VotingTrend } from '@services/admin.api';
import { useToast } from '@hooks/useToast';
import { logger } from '@utils/logger';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import '@styles/admin-shared.css';
import './AdminDashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trends, setTrends] = useState<VotingTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Usar Page Visibility API para pausar polling cuando no está activa
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausar polling cuando la página no está visible
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        logger.debug('Dashboard polling paused - page hidden');
      } else {
        // Reanudar polling cuando la página vuelve a ser visible
        fetchDashboardData();
        intervalRef.current = setInterval(fetchDashboardData, 30000);
        logger.debug('Dashboard polling resumed - page visible');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Iniciar polling si la página está visible
    if (!document.hidden) {
      intervalRef.current = setInterval(fetchDashboardData, 30000) as unknown as number;
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, activityData, trendsData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivity(10),
        adminApi.getVotingTrends(7),
      ]);

      setStats(statsData);
      setActivities(activityData);
      setTrends(trendsData);
      logger.info('Dashboard data loaded', { stats: statsData.totalUsers });
    } catch (error: unknown) {
      logger.error('Error fetching dashboard data', error);
      showToast('error', 'Error al cargar datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración del gráfico de tendencias
  const chartData = {
    labels: trends.map((t) => {
      const date = new Date(t.date);
      return date.toLocaleDateString('es-GT', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Votos',
        data: trends.map((t) => t.votes),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LOGIN':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        );
      case 'VOTE_CAST':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        );
      case 'PROFILE_UPDATED':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard Administrativo" subtitle="Cargando datos...">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Dashboard Administrativo" 
      subtitle={`Bienvenido, ${user?.email}`}
      actions={
        <button className="btn-primary" onClick={fetchDashboardData}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Actualizar
        </button>
      }
    >

      {stats && (
        <>
          {/* Estadísticas principales */}
          <div className="stats-grid">
              <div className="stat-card stat-card-users">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Usuarios</p>
                  <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
                  <p className="stat-growth positive">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    +{stats.userGrowth}% esta semana
                  </p>
                </div>
              </div>

              <div className="stat-card stat-card-elections">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Elecciones Activas</p>
                  <p className="stat-value">{stats.activeElections}</p>
                  <p className="stat-detail">de {stats.totalElections} totales</p>
                </div>
              </div>

              <div className="stat-card stat-card-votes">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Votos Totales</p>
                  <p className="stat-value">{stats.totalVotes.toLocaleString()}</p>
                  <p className="stat-growth positive">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    +{stats.votesGrowth}% vs ayer
                  </p>
                </div>
              </div>

              <div className="stat-card stat-card-today">
                <div className="stat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Votos Hoy</p>
                  <p className="stat-value">{stats.todayVotes}</p>
                  <p className="stat-detail">en tiempo real</p>
                </div>
              </div>
            </div>

            {/* Gráfico de tendencias y actividad reciente */}
            <div className="dashboard-grid">
              <div className="dashboard-card chart-card">
                <div className="card-header">
                  <h3>Tendencia de Votación (7 días)</h3>
                  <button className="btn-card-action">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>
                </div>
                <div className="chart-container">
                  <Line data={chartData} options={chartOptions as any} />
                </div>
              </div>

              <div className="dashboard-card activity-card">
                <div className="card-header">
                  <h3>Actividad Reciente</h3>
                  <button className="btn-card-action">Ver Todas</button>
                </div>
                <div className="activity-list">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                        <div className="activity-info">
                          <p className="activity-action">{activity.action}</p>
                          <p className="activity-meta">
                            {activity.userEmail} •{' '}
                            {new Date(activity.timestamp).toLocaleString('es-GT', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="activity-empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p>No hay actividad reciente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => navigate('/admin/create-election')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  <span>Nueva Elección</span>
                </button>

                <button className="action-btn" onClick={() => navigate('/admin/elections')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <span>Gestionar Elecciones</span>
                </button>

                <button className="action-btn" onClick={() => navigate('/admin/votes-history')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>Historial de Votos</span>
                </button>

                <button className="action-btn" onClick={() => navigate('/admin/users')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Gestionar Usuarios</span>
                </button>
              </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
