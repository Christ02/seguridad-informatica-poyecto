/**
 * Dashboard Component
 * Panel principal después de iniciar sesión
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Sidebar } from '@components/Sidebar';
import { electionsApi } from '@services/elections.api';
import { votesApi } from '@services/votes.api';
import type { Election } from '@services/elections.api';
import './Dashboard.css';

interface ElectionWithVoteStatus extends Election {
  hasVoted?: boolean;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState<ElectionWithVoteStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElections = async () => {
      try {
        setLoading(true);
        const electionsData = await electionsApi.getAll();
        const electionsWithStatus = await Promise.all(
          electionsData.map(async (election) => {
            try {
              const { hasVoted } = await votesApi.hasVoted(election.id);
              return { ...election, hasVoted };
            } catch {
              return { ...election, hasVoted: false };
            }
          })
        );
        setElections(electionsWithStatus);
      } catch (error) {
        console.error('Error loading elections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { text: 'En Curso', class: 'badge-active' },
      DRAFT: { text: 'Próximamente', class: 'badge-upcoming' },
      COMPLETED: { text: 'Finalizada', class: 'badge-completed' },
      CLOSED: { text: 'Cerrada', class: 'badge-closed' },
    };
    return badges[status as keyof typeof badges] || { text: status, class: 'badge-active' };
  };

  const handleVote = (electionId: string) => {
    navigate(`/vote/${electionId}`);
  };

  const handleViewResults = (electionId: string) => {
    navigate(`/results/${electionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const activeElections = elections.filter(e => e.status === 'ACTIVE');
  const upcomingElections = elections.filter(e => e.status === 'DRAFT');
  const completedElections = elections.filter(e => e.status === 'COMPLETED' || e.status === 'CLOSED');

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-wrapper">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-actions">
            <div className="user-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{user?.email || 'Usuario'}</span>
            </div>
            <button className="btn-logout" onClick={logout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-content">
            {/* Page Title */}
            <h1>Elecciones Disponibles</h1>
            <p>Participa en las votaciones activas para tu comunidad.</p>

            {/* Search and Filters */}
            <div className="search-filters-section">
              <div className="search-box-dashboard">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar elección por nombre"
                />
              </div>
              <div className="filter-buttons">
                <button className="filter-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Fecha de Cierre
                </button>
                <button className="filter-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Más Recientes
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando elecciones...</p>
              </div>
            ) : (
              <>
                {/* Active Elections */}
                {activeElections.length > 0 && (
                  <section className="elections-section">
                    <div className="section-header">
                      <h2>Elecciones Activas</h2>
                      <span className="section-count">{activeElections.length}</span>
                    </div>

                    <div className="elections-grid">
                      {activeElections.map((election) => (
                        <div key={election.id} className="election-card">
                          <div 
                            className="election-image"
                            style={{
                              background: 'linear-gradient(135deg, #d4b896 0%, #5f6d5f 100%)',
                            }}
                          />
                          <div className="election-content">
                          <div className="election-header">
                            <h3>{election.title}</h3>
                            <span className={`status-badge ${getStatusBadge(election.status).class}`}>
                              {getStatusBadge(election.status).text}
                            </span>
                          </div>

                          <p className="election-description">{election.description}</p>

                          <div className="election-meta">
                            <div className="meta-item">
                                <span>Disponible del {formatDate(election.startDate)} al {formatDate(election.endDate)}</span>
                            </div>
                          </div>

                          <div className="election-actions">
                            {election.hasVoted ? (
                              <div className="voted-actions">
                                <div className="voted-badge">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Ya has votado
                                </div>
                                <button className="btn-view-results" onClick={() => handleViewResults(election.id)}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 20V10" />
                                    <path d="M12 20V4" />
                                    <path d="M6 20v-6" />
                                  </svg>
                                  Ver Resultados Parciales
                                </button>
                              </div>
                            ) : (
                              <button className="btn-vote" onClick={() => handleVote(election.id)}>
                                Votar Ahora
                              </button>
                            )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Upcoming Elections */}
                {upcomingElections.length > 0 && (
                  <section className="elections-section">
                    <div className="section-header">
                      <h2>Próximas Elecciones</h2>
                      <span className="section-count">{upcomingElections.length}</span>
                    </div>

                    <div className="elections-grid">
                      {upcomingElections.map((election) => (
                        <div key={election.id} className="election-card">
                          <div 
                            className="election-image"
                            style={{
                              background: 'linear-gradient(135deg, #a8c5a0 0%, #5a7a52 100%)',
                            }}
                          />
                          <div className="election-content">
                          <div className="election-header">
                            <h3>{election.title}</h3>
                            <span className={`status-badge ${getStatusBadge(election.status).class}`}>
                              {getStatusBadge(election.status).text}
                            </span>
                          </div>

                          <p className="election-description">{election.description}</p>

                          <div className="election-meta">
                            <div className="meta-item">
                                <span>Cierra en 2 días</span>
                            </div>
                          </div>

                          <div className="election-actions">
                            <button className="btn-upcoming" disabled>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              Próximamente
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Completed Elections */}
                {completedElections.length > 0 && (
                  <section className="elections-section">
                    <div className="section-header">
                      <h2>Elecciones Finalizadas</h2>
                      <span className="section-count">{completedElections.length}</span>
                    </div>

                    <div className="elections-grid">
                      {completedElections.map((election) => (
                        <div key={election.id} className="election-card completed">
                          <div 
                            className="election-image"
                            style={{
                              background: 'linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)',
                            }}
                          />
                          <div className="election-content">
                          <div className="election-header">
                            <h3>{election.title}</h3>
                            <span className={`status-badge ${getStatusBadge(election.status).class}`}>
                              {getStatusBadge(election.status).text}
                            </span>
                          </div>

                          <p className="election-description">{election.description}</p>

                          <div className="election-meta">
                            <div className="meta-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              <span>{election.totalVotes} votos totales</span>
                            </div>
                          </div>

                          <div className="election-actions">
                            <button className="btn-results" onClick={() => handleViewResults(election.id)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 20V10" />
                                <path d="M12 20V4" />
                                <path d="M6 20v-6" />
                              </svg>
                              Ver Resultados
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
                {elections.length === 0 && !loading && (
                  <div className="empty-state">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 11H3v10h6V11zM21 11h-6v10h6V11z" />
                      <path d="M21 3h-6v4h6V3zM9 3H3v4h6V3z" />
                    </svg>
                    <h3>No hay más elecciones disponibles</h3>
                    <p>Actualmente no tienes más elecciones disponibles. Se te notificará cuando puedas participar en una nueva votación.</p>
                  </div>
                )}
              </>
            )}

            {/* Security Info */}
            <section className="security-section">
              <h2>Seguridad y Privacidad</h2>
              <div className="security-grid">
                <div className="security-card">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <h3>Cifrado RSA-4096</h3>
                  <p>Todos los votos están protegidos con cifrado de nivel militar.</p>
                </div>
                <div className="security-card">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <h3>Anonimato Total</h3>
                  <p>Tu identidad nunca se asocia con tu voto.</p>
                </div>
                <div className="security-card">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <h3>Verificación</h3>
                  <p>Verifica que tu voto fue contabilizado correctamente.</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
