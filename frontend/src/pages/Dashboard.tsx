/**
 * Dashboard Component
 * Panel principal después de iniciar sesión
 */

import { useAuth } from '@features/auth/hooks/useAuth';
import './Dashboard.css';

export function Dashboard() {
  const { user, logout } = useAuth();

  const elections = [
    {
      id: '1',
      title: 'Elección Presidencial 2025',
      status: 'active',
      startDate: '2025-11-15',
      endDate: '2025-11-30',
      totalVotes: 1248,
      hasVoted: false,
    },
    {
      id: '2',
      title: 'Consejo Estudiantil',
      status: 'upcoming',
      startDate: '2025-12-01',
      endDate: '2025-12-15',
      totalVotes: 0,
      hasVoted: false,
    },
    {
      id: '3',
      title: 'Reforma Estatutaria',
      status: 'completed',
      startDate: '2025-10-01',
      endDate: '2025-10-15',
      totalVotes: 2856,
      hasVoted: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'En Curso', class: 'badge-active' },
      upcoming: { text: 'Próximamente', class: 'badge-upcoming' },
      completed: { text: 'Finalizada', class: 'badge-completed' },
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const handleVote = (electionId: string) => {
    console.log('Votando en elección:', electionId);
    // Implementar lógica de votación
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="portal-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb">
              <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
            </svg>
            <h1>Portal de Votación Ciudadana</h1>
          </div>

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
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="welcome-content">
                <h2>Bienvenido al Sistema Electoral Digital</h2>
                <p>Participa de manera segura en las elecciones activas. Tu voto es anónimo y está protegido con cifrado de nivel militar.</p>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="stats-section">
            <div className="stat-card">
              <div className="stat-icon active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Elecciones Activas</p>
                <p className="stat-value">1</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon upcoming">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Próximas</p>
                <p className="stat-value">1</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon completed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Participaciones</p>
                <p className="stat-value">1</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon security">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Nivel de Seguridad</p>
                <p className="stat-value">100%</p>
              </div>
            </div>
          </section>

          {/* Elections List */}
          <section className="elections-section">
            <h3>Elecciones Disponibles</h3>
            <div className="elections-grid">
              {elections.map((election) => (
                <div key={election.id} className="election-card">
                  <div className="election-header">
                    <h4>{election.title}</h4>
                    <span className={`badge ${getStatusBadge(election.status).class}`}>
                      {getStatusBadge(election.status).text}
                    </span>
                  </div>

                  <div className="election-details">
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>
                        {new Date(election.startDate).toLocaleDateString('es-ES')} -{' '}
                        {new Date(election.endDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{election.totalVotes.toLocaleString('es-ES')} votos registrados</span>
                    </div>
                  </div>

                  <div className="election-actions">
                    {election.status === 'active' && !election.hasVoted && (
                      <button
                        className="btn-vote"
                        onClick={() => handleVote(election.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Votar Ahora
                      </button>
                    )}

                    {election.hasVoted && (
                      <button className="btn-voted" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Ya has votado
                      </button>
                    )}

                    {election.status === 'upcoming' && (
                      <button className="btn-upcoming" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Próximamente
                      </button>
                    )}

                    {election.status === 'completed' && (
                      <button className="btn-results">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        Ver Resultados
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Security Info */}
          <section className="security-info-section">
            <div className="security-info-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <div>
                <h4>Tu voto está protegido</h4>
                <p>Cifrado RSA-4096 | Anonimato garantizado | Verificación blockchain</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>&copy; 2025 Portal de Votación Ciudadana | Todos los derechos reservados</p>
          <div className="footer-links">
            <a href="/privacy">Política de Privacidad</a>
            <span>•</span>
            <a href="/terms">Términos de Uso</a>
            <span>•</span>
            <a href="/support">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

