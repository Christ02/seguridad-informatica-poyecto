/**
 * ResultsListPage Component
 * Lista de todas las elecciones con resultados disponibles
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@components/Sidebar';
import { electionsApi, type Election } from '@services/elections.api';
import './ResultsListPage.css';

export function ResultsListPage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await electionsApi.getAll();
      console.log('📊 Todas las elecciones:', data);
      console.log('📊 Estados disponibles:', data.map(e => e.status));
      
      // Filtrar solo elecciones CLOSED o COMPLETED
      const electionsWithResults = data.filter(
        (e) => e.status === 'CLOSED' || e.status === 'COMPLETED'
      );
      console.log('📊 Elecciones con resultados:', electionsWithResults);
      
      setElections(electionsWithResults);
    } catch (err: any) {
      console.error('❌ Error loading elections:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar los resultados';
      setError(errorMessage);
      console.error('Error details:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (electionId: string) => {
    navigate(`/results/${electionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      CLOSED: { text: 'Cerrada', class: 'badge-closed' },
      COMPLETED: { text: 'Finalizada', class: 'badge-completed' },
    };
    return badges[status as keyof typeof badges] || { text: status, class: 'badge-closed' };
  };

  return (
    <div className="results-list-container">
      <Sidebar />

      <main className="results-list-main">
        <header className="results-list-header">
          <div>
            <h1>Resultados de Elecciones</h1>
            <p className="results-list-subtitle">
              Consulta los resultados de elecciones finalizadas
            </p>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando elecciones...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Error al cargar resultados</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={loadElections}>
              Reintentar
            </button>
          </div>
        ) : elections.length === 0 ? (
          <div className="empty-state">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            <h3>No hay resultados disponibles</h3>
            <p>Aún no hay elecciones finalizadas con resultados disponibles.</p>
          </div>
        ) : (
          <div className="elections-grid">
            {elections.map((election) => {
              const badge = getStatusBadge(election.status);
              return (
                <div key={election.id} className="election-result-card">
                  <div className="election-result-header">
                    <h3>{election.title}</h3>
                    <span className={`status-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>

                  <p className="election-result-description">
                    {election.description}
                  </p>

                  <div className="election-result-meta">
                    <div className="meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>
                        {formatDate(election.startDate)} - {formatDate(election.endDate)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{election.totalVotes} votos</span>
                    </div>
                  </div>

                  <button
                    className="btn-view-results"
                    onClick={() => handleViewResults(election.id)}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 20V10" />
                      <path d="M12 20V4" />
                      <path d="M6 20v-6" />
                    </svg>
                    Ver Resultados Detallados
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

