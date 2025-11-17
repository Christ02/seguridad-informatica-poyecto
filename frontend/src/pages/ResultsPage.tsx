/**
 * Enhanced ResultsPage Component
 * Página de visualización de resultados con análisis detallado
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@components/Sidebar';
import { adminApi } from '@services/admin.api';
import type { DetailedResults, Demographics, CandidateResult } from '@services/admin.api';
import { candidatesApi } from '@services/candidates.api';
import { electionsApi } from '@services/elections.api';
import { useAuthStore } from '@features/auth/store/authStore';
import { UserRole } from '@/types';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './ResultsPage.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function ResultsPage() {
  const { electionId } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  const [results, setResults] = useState<DetailedResults | null>(null);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'demographics'>('results');

  useEffect(() => {
    loadData();
  }, [electionId]);

  const loadData = async () => {
    if (!electionId) {
      setError('ID de elección no válido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('[ResultsPage] Loading results for election:', electionId);
      console.log('[ResultsPage] User role:', user?.role);
      console.log('[ResultsPage] Is admin?:', isAdmin);
      
      if (isAdmin) {
        console.log('[ResultsPage] Using ADMIN endpoints');
        const [resultsData, demographicsData] = await Promise.all([
          adminApi.getDetailedResults(electionId),
          adminApi.getDemographics(electionId),
        ]);
        setResults(resultsData);
        setDemographics(demographicsData);
      } else {
        console.log('[ResultsPage] Using PUBLIC endpoints');
        // Para usuarios normales, construir formato similar desde API pública
        const [election, candidateResults] = await Promise.all([
          electionsApi.getById(electionId),
          candidatesApi.getResults(electionId),
        ]);
        
        console.log('[ResultsPage] Election loaded:', election);
        console.log('[ResultsPage] Candidate results:', candidateResults);
        
        const totalVotes = candidateResults.reduce((sum, c) => sum + c.votes, 0);
        
        // Mapear resultados asegurando que party siempre tenga valor
        const mappedCandidates: CandidateResult[] = candidateResults.map(c => ({
          id: c.id,
          name: c.name,
          party: c.party || 'Independiente',
          votes: c.votes,
          percentage: c.percentage,
          photoUrl: c.photoUrl || '',
        }));
        
        const resultsData: DetailedResults = {
          election: {
            id: election.id,
            title: election.title,
            description: election.description,
            status: election.status,
            startDate: election.startDate,
            endDate: election.endDate,
          },
          results: {
            totalVotes,
            candidates: mappedCandidates,
            winner: mappedCandidates[0] || null,
          },
        };
        
        console.log('[ResultsPage] Results formatted:', resultsData);
        setResults(resultsData);
      }
    } catch (err: any) {
      console.error('[ResultsPage] Error loading results:', err);
      console.error('[ResultsPage] Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError('Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  // Colores para gráficos
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];

  // Configuración del gráfico de pie
  const pieData = results ? {
    labels: results.results.candidates.map(c => c.name),
    datasets: [{
      data: results.results.candidates.map(c => c.votes),
      backgroundColor: colors.slice(0, results.results.candidates.length),
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  } : null;

  // Configuración del gráfico de barras
  const barData = results ? {
    labels: results.results.candidates.map(c => c.name),
    datasets: [{
      label: 'Votos',
      data: results.results.candidates.map(c => c.votes),
      backgroundColor: colors.slice(0, results.results.candidates.length),
      borderRadius: 8,
    }],
  } : null;

  // Configuración de demografía por departamento
  const deptData = demographics ? {
    labels: demographics.byDepartment.map(d => d.department),
    datasets: [{
      label: 'Votos',
      data: demographics.byDepartment.map(d => d.votes),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
    }],
  } : null;

  // Configuración de demografía por edad
  const ageData = demographics ? {
    labels: demographics.byAge.map(a => a.ageGroup),
    datasets: [{
      data: demographics.byAge.map(a => a.votes),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
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
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
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

  if (loading) {
    return (
      <div className="results-page-container">
        <Sidebar />
        <main className="results-page-main">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando resultados...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="results-page-container">
        <Sidebar />
        <main className="results-page-main">
          <div className="error-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h3>Error al cargar resultados</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={loadData}>Reintentar</button>
          </div>
        </main>
      </div>
    );
  }

  const totalVotes = results.results.totalVotes;
  const winner = results.results.winner;

  return (
    <div className="results-page-container">
      <Sidebar />

      <main className="results-page-main">
        {/* Header */}
        <header className="results-header">
          <div>
            <h1>{results.election.title}</h1>
            <p className="results-subtitle">{results.election.description}</p>
            <div className="election-meta">
              <span className={`status-badge status-${results.election.status.toLowerCase()}`}>
                {results.election.status}
              </span>
              <span className="meta-divider">•</span>
              <span>{totalVotes.toLocaleString()} votos totales</span>
            </div>
          </div>
          <button className="btn-export">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar Reporte
          </button>
        </header>

        {/* Info Box */}
        <div className="page-info-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <p>Los resultados son verificables y auditables mediante tecnología blockchain</p>
        </div>

        {/* Winner Card */}
        {winner && (
          <div className="winner-card">
            <div className="winner-trophy">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <div className="winner-info">
              <p className="winner-label">Ganador</p>
              <h2 className="winner-name">{winner.name}</h2>
              <p className="winner-stats">
                {winner.votes.toLocaleString()} votos ({winner.percentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        {isAdmin && demographics && (
          <div className="results-tabs">
            <button
              className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Resultados
            </button>
            <button
              className={`tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
              onClick={() => setActiveTab('demographics')}
            >
              Análisis Demográfico
            </button>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <>
            {/* Charts Grid */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Distribución de Votos</h3>
                <div className="chart-wrapper">
                  {pieData && <Pie data={pieData} options={chartOptions as any} />}
                </div>
              </div>

              <div className="chart-card">
                <h3>Comparación de Candidatos</h3>
                <div className="chart-wrapper">
                  {barData && <Bar data={barData} options={barOptions as any} />}
                </div>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="candidates-table-card">
              <h3>Resultados Detallados</h3>
              <div className="candidates-table">
                <table>
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Candidato</th>
                      <th>Partido</th>
                      <th>Votos</th>
                      <th>Porcentaje</th>
                      <th>Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.candidates.map((candidate, index) => {
                      const firstCandidate = results.results.candidates[0];
                      const diff = index === 0 || !firstCandidate ? 0 : firstCandidate.votes - candidate.votes;
                      return (
                        <tr key={candidate.id} className={index === 0 ? 'winner-row' : ''}>
                          <td>
                            <span className="position-badge">{index + 1}</span>
                          </td>
                          <td>
                            <div className="candidate-cell">
                              {candidate.photoUrl && (
                                <img src={candidate.photoUrl} alt={candidate.name} className="candidate-photo" />
                              )}
                              <span className="candidate-name">{candidate.name}</span>
                            </div>
                          </td>
                          <td>{candidate.party}</td>
                          <td className="votes-cell">{candidate.votes.toLocaleString()}</td>
                          <td>
                            <div className="percentage-bar">
                              <div className="percentage-fill" style={{ width: `${candidate.percentage}%` }}></div>
                              <span className="percentage-text">{candidate.percentage.toFixed(2)}%</span>
                            </div>
                          </td>
                          <td className="diff-cell">
                            {index === 0 ? '—' : `- ${diff.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Demographics Tab */}
        {activeTab === 'demographics' && demographics && (
          <div className="demographics-section">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Votos por Departamento</h3>
                <div className="chart-wrapper">
                  {deptData && <Bar data={deptData} options={barOptions as any} />}
                </div>
              </div>

              <div className="chart-card">
                <h3>Votos por Grupo de Edad</h3>
                <div className="chart-wrapper">
                  {ageData && <Pie data={ageData} options={chartOptions as any} />}
                </div>
              </div>
            </div>

            {/* Demographics Tables */}
            <div className="demographics-tables">
              <div className="demographics-table-card">
                <h4>Por Departamento</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Departamento</th>
                      <th>Votos</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demographics.byDepartment.map((dept) => {
                      const percentage = (dept.votes / totalVotes) * 100;
                      return (
                        <tr key={dept.department}>
                          <td>{dept.department}</td>
                          <td>{dept.votes.toLocaleString()}</td>
                          <td>{percentage.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="demographics-table-card">
                <h4>Por Grupo de Edad</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Grupo de Edad</th>
                      <th>Votos</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demographics.byAge.map((age) => {
                      const percentage = (age.votes / totalVotes) * 100;
                      return (
                        <tr key={age.ageGroup}>
                          <td>{age.ageGroup}</td>
                          <td>{age.votes.toLocaleString()}</td>
                          <td>{percentage.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
