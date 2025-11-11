/**
 * AdminDashboard Component
 * Panel de administración para usuarios administradores
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import { useAuth } from '@features/auth/hooks/useAuth';
import './AdminDashboard.css';

interface Election {
  id: string;
  name: string;
  status: 'active' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    totalVoters: 1250345,
    activeElections: 5,
    votesToday: 78912,
    participationRate: 65.2,
  };

  const activeElections: Election[] = [
    {
      id: '1',
      name: 'Elecciones Presidenciales 2024',
      status: 'active',
      startDate: '15 Oct, 2024',
      endDate: '30 Oct, 2024',
    },
    {
      id: '2',
      name: 'Referéndum Constitucional',
      status: 'upcoming',
      startDate: '01 Nov, 2024',
      endDate: '10 Nov, 2024',
    },
    {
      id: '3',
      name: 'Elecciones Municipales',
      status: 'completed',
      startDate: '01 Sep, 2024',
      endDate: '15 Sep, 2024',
    },
  ];

  const activityData = [
    { day: 'Lun', votes: 45000 },
    { day: 'Mar', votes: 38000 },
    { day: 'Mié', votes: 52000 },
    { day: 'Jue', votes: 78912 },
    { day: 'Vie', votes: 65000 },
    { day: 'Sáb', votes: 42000 },
    { day: 'Dom', votes: 58000 },
  ];

  const maxVotes = Math.max(...activityData.map((d) => d.votes));

  const getStatusBadge = (status: Election['status']) => {
    const badges = {
      active: { text: 'Activa', class: 'status-active' },
      upcoming: { text: 'Próxima', class: 'status-upcoming' },
      completed: { text: 'Finalizada', class: 'status-completed' },
    };
    return badges[status];
  };

  return (
    <div className="admin-dashboard-container">
      <Sidebar />

      <div className="admin-dashboard-wrapper">
        {/* Header */}
        <header className="admin-header">
          <h1>Panel de Administración</h1>

          <div className="admin-header-actions">
            <div className="search-box-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn-notification" aria-label="Notificaciones">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            <button className="btn-settings" aria-label="Configuración">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m6-12h-6m-6 0H1m17.66 5.34l-4.24 4.24m0-8.48l4.24 4.24M6.34 6.34l4.24 4.24m0 0l-4.24 4.24" />
              </svg>
            </button>

            <div className="admin-user-info">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2563eb&color=fff`}
                alt="Avatar"
                className="admin-avatar"
              />
              <div className="admin-user-details">
                <span className="admin-user-name">{user?.name || 'Admin Name'}</span>
                <span className="admin-user-role">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-content">
            {/* Header Section */}
            <div className="admin-section-header">
              <h2>Resumen General</h2>
              <button className="btn-create-election">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Crear Nueva Elección
              </button>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-header">
                  <span className="stat-label">Total de Votantes Registrados</span>
                </div>
                <p className="stat-value">{stats.totalVoters.toLocaleString('es-ES')}</p>
              </div>

              <div className="admin-stat-card">
                <div className="stat-header">
                  <span className="stat-label">Elecciones Activas</span>
                </div>
                <p className="stat-value">{stats.activeElections}</p>
              </div>

              <div className="admin-stat-card">
                <div className="stat-header">
                  <span className="stat-label">Votos Emitidos Hoy</span>
                </div>
                <p className="stat-value">{stats.votesToday.toLocaleString('es-ES')}</p>
              </div>

              <div className="admin-stat-card">
                <div className="stat-header">
                  <span className="stat-label">Tasa de Participación</span>
                </div>
                <p className="stat-value">{stats.participationRate}%</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="admin-two-column">
              {/* Active Elections Table */}
              <div className="admin-card">
                <h3>Resumen de Elecciones Activas</h3>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NOMBRE DE LA ELECCIÓN</th>
                      <th>ESTADO</th>
                      <th>FECHA DE INICIO</th>
                      <th>FECHA DE FIN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeElections.map((election) => {
                      const badge = getStatusBadge(election.status);
                      return (
                        <tr key={election.id}>
                          <td className="election-name-cell">{election.name}</td>
                          <td>
                            <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                          </td>
                          <td className="date-cell">{election.startDate}</td>
                          <td className="date-cell">{election.endDate}</td>
                          <td>
                            <button className="btn-action">
                              {election.status === 'completed' ? 'Ver Resultados' : 'Gestionar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Quick Actions */}
              <div className="admin-card quick-actions-card">
                <h3>Acciones Rápidas</h3>

                <div className="quick-actions-list">
                  <button className="quick-action-item">
                    <div className="quick-action-icon create">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <div className="quick-action-content">
                      <h4>Crear Nueva Elección</h4>
                      <p>Configura y lanza una votación.</p>
                    </div>
                  </button>

                  <button className="quick-action-item">
                    <div className="quick-action-icon manage">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="quick-action-content">
                      <h4>Gestionar Votantes</h4>
                      <p>Añade, edita o elimina votantes.</p>
                    </div>
                  </button>

                  <button className="quick-action-item">
                    <div className="quick-action-icon reports">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <div className="quick-action-content">
                      <h4>Ver Reportes</h4>
                      <p>Analiza resultados y participación.</p>
                    </div>
                  </button>

                  <button className="quick-action-item">
                    <div className="quick-action-icon settings">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m6-12h-6m-6 0H1m17.66 5.34l-4.24 4.24m0-8.48l4.24 4.24M6.34 6.34l4.24 4.24m0 0l-4.24 4.24" />
                      </svg>
                    </div>
                    <div className="quick-action-content">
                      <h4>Configuración del Sistema</h4>
                      <p>Ajustes generales de la plataforma.</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="admin-card">
              <div className="chart-header">
                <div>
                  <h3>Actividad de Votación</h3>
                  <p className="chart-subtitle">Últimos 7 días</p>
                </div>
                <span className="trend-indicator positive">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  +5.2%
                </span>
              </div>

              <div className="chart-container">
                <div className="chart-bars">
                  {activityData.map((data) => {
                    const heightPercent = (data.votes / maxVotes) * 100;
                    return (
                      <div key={data.day} className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{ height: `${heightPercent}%` }}
                          title={`${data.votes.toLocaleString('es-ES')} votos`}
                        />
                        <span className="chart-label">{data.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

