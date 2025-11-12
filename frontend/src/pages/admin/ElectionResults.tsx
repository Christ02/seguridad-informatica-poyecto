/**
 * ElectionResults Component
 * Página para visualizar resultados de elecciones
 */

import { useState, useEffect } from 'react';
import { AdminLayout } from '@components/AdminLayout';
import { electionsApi, type Election } from '@services/elections.api';
import { candidatesApi, type Candidate } from '@services/candidates.api';
import { useToast } from '@hooks/useToast';
import { logger } from '@utils/logger';
import '@styles/admin-shared.css';
import './ElectionResults.css';

export function ElectionResults() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadCandidates(selectedElectionId);
    }
  }, [selectedElectionId]);

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await electionsApi.getAll();
      setElections(data);
      
      // Seleccionar la primera elección completada por defecto
      const completed = data.find(e => e.status === 'COMPLETED' || e.status === 'CLOSED');
      if (completed) {
        setSelectedElectionId(completed.id);
      } else if (data.length > 0) {
        setSelectedElectionId(data[0].id);
      }
      
      logger.info('Elections loaded for results', { count: data.length });
    } catch (error) {
      logger.error('Error loading elections', error);
      showToast('error', 'Error al cargar las elecciones');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (electionId: string) => {
    try {
      const data = await candidatesApi.getByElection(electionId);
      setCandidates(data.sort((a, b) => b.voteCount - a.voteCount)); // Ordenar por votos descendente
      logger.info('Candidates loaded', { count: data.length });
    } catch (error) {
      logger.error('Error loading candidates', error);
      showToast('error', 'Error al cargar los candidatos');
    }
  };

  const selectedElection = elections.find(e => e.id === selectedElectionId);
  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  const handleExportPDF = () => {
    logger.info('Exporting results to PDF');
    showToast('info', 'Exportando resultados a PDF...');
    // TODO: Implementar exportación a PDF
  };

  const handleExportCSV = () => {
    logger.info('Exporting results to CSV');
    
    // Crear CSV
    const headers = ['Candidato', 'Partido', 'Votos', 'Porcentaje'];
    const rows = candidates.map(c => [
      c.name,
      c.party || 'Independiente',
      c.voteCount.toString(),
      totalVotes > 0 ? `${((c.voteCount / totalVotes) * 100).toFixed(2)}%` : '0%'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resultados-${selectedElection?.title.replace(/\s+/g, '-')}.csv`;
    link.click();
    
    showToast('success', 'Resultados exportados a CSV');
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', { 
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout
      title="Resultados de Elecciones"
      subtitle="Visualiza y analiza los resultados de las votaciones"
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
          <button className="btn-primary" onClick={handleExportPDF}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar PDF
          </button>
        </div>
      }
    >
      {/* Election Selector */}
      <div className="admin-card">
        <div className="form-group">
          <label htmlFor="electionSelect">Seleccionar Elección</label>
          <select
            id="electionSelect"
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
          >
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title} - {election.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando resultados...</p>
        </div>
      ) : selectedElection ? (
        <>
          {/* Election Info */}
          <div className="admin-card">
            <h2>{selectedElection.title}</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{selectedElection.description}</p>
            <div className="grid-3-cols">
              <div className="stat-box">
                <div className="stat-label">Total de Votos</div>
                <div className="stat-value">{totalVotes.toLocaleString()}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Fecha de Inicio</div>
                <div className="stat-value">{formatDate(selectedElection.startDate)}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Fecha de Fin</div>
                <div className="stat-value">{formatDate(selectedElection.endDate)}</div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="admin-card">
            <h2>Resultados por Candidato</h2>
            {candidates.length > 0 ? (
              <div className="results-list">
                {candidates.map((candidate, index) => {
                  const percentage = getPercentage(candidate.voteCount);
                  const isWinner = index === 0 && totalVotes > 0;
                  
                  return (
                    <div key={candidate.id} className={`result-item ${isWinner ? 'winner' : ''}`}>
                      <div className="result-header">
                        <div className="candidate-info-result">
                          <img
                            src={candidate.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=2563eb&color=fff&size=100`}
                            alt={candidate.name}
                            className="candidate-photo-small"
                          />
                          <div>
                            <h3>{candidate.name}</h3>
                            {candidate.party && <p className="party-name">{candidate.party}</p>}
                          </div>
                        </div>
                        <div className="result-stats">
                          <span className="vote-count">{candidate.voteCount.toLocaleString()} votos</span>
                          <span className="vote-percentage">{percentage}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {isWinner && <span className="winner-badge">🏆 Ganador</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <p>No hay candidatos para esta elección</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p>No hay elecciones disponibles</p>
        </div>
      )}
    </AdminLayout>
  );
}
