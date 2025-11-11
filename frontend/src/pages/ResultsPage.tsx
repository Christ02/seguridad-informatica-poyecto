/**
 * ResultsPage Component
 * Página pública de resultados de elecciones
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ResultsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Election {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'upcoming';
  startDate: string;
  endDate: string;
  totalVotes: number;
  eligibleVoters: number;
}

interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  imageUrl?: string;
}

export function ResultsPage() {
  const [selectedElection, setSelectedElection] = useState<string>('1');
  const [viewMode, setViewMode] = useState<'general' | 'regional'>('general');

  const elections: Election[] = [
    {
      id: '1',
      title: 'Elección Presidencial 2025',
      status: 'active',
      startDate: '2025-11-15',
      endDate: '2025-11-30',
      totalVotes: 1248567,
      eligibleVoters: 3500000,
    },
    {
      id: '2',
      title: 'Reforma Estatutaria',
      status: 'completed',
      startDate: '2025-10-01',
      endDate: '2025-10-15',
      totalVotes: 2856345,
      eligibleVoters: 3500000,
    },
  ];

  const results: CandidateResult[] = [
    {
      id: '1',
      name: 'María González',
      party: 'Partido Progresista',
      votes: 512345,
      percentage: 41.0,
      imageUrl: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=2563eb&color=fff&size=128',
    },
    {
      id: '2',
      name: 'Juan Martínez',
      party: 'Alianza Nacional',
      votes: 487123,
      percentage: 39.0,
      imageUrl: 'https://ui-avatars.com/api/?name=Juan+Martinez&background=10b981&color=fff&size=128',
    },
    {
      id: '3',
      name: 'Ana Rodríguez',
      party: 'Movimiento Social',
      votes: 249099,
      percentage: 20.0,
      imageUrl: 'https://ui-avatars.com/api/?name=Ana+Rodriguez&background=f59e0b&color=fff&size=128',
    },
  ];

  const currentElection = elections.find(e => e.id === selectedElection);
  const participationRate = currentElection
    ? ((currentElection.totalVotes / currentElection.eligibleVoters) * 100).toFixed(1)
    : '0';

  const barChartData = {
    labels: results.map(r => r.name),
    datasets: [
      {
        label: 'Votos',
        data: results.map(r => r.votes),
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b'],
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => value.toLocaleString(),
        },
      },
    },
  };

  const doughnutData = {
    labels: ['Votantes', 'No votantes'],
    datasets: [
      {
        data: [
          currentElection?.totalVotes || 0,
          (currentElection?.eligibleVoters || 0) - (currentElection?.totalVotes || 0),
        ],
        backgroundColor: ['#2563eb', '#e2e8f0'],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const handleExportResults = () => {
    const data = {
      election: currentElection?.title,
      date: new Date().toISOString(),
      results: results,
      totalVotes: currentElection?.totalVotes,
      participationRate: `${participationRate}%`,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados-${selectedElection}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-page-container">
      <Sidebar />

      <div className="results-page-wrapper">
        {/* Header */}
        <header className="results-header">
          <div>
            <h1>Resultados de Elecciones</h1>
            <p className="results-description">
              Resultados oficiales en tiempo real de las elecciones
            </p>
          </div>
          <button className="btn-export-results" onClick={handleExportResults}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar Resultados
          </button>
        </header>

        {/* Main Content */}
        <main className="results-main">
          {/* Election Selector */}
          <div className="election-selector">
            <label>Seleccionar Elección:</label>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
            >
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title} - {election.status === 'active' ? 'En Curso' : 'Finalizada'}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#eff6ff' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total de Votos</span>
                <span className="stat-value">{currentElection?.totalVotes.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Participación</span>
                <span className="stat-value">{participationRate}%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Votantes Registrados</span>
                <span className="stat-value">{currentElection?.eligibleVoters.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="results-section">
            <div className="section-header">
              <h2>Resultados por Candidato</h2>
              <div className="view-toggle">
                <button
                  className={viewMode === 'general' ? 'active' : ''}
                  onClick={() => setViewMode('general')}
                >
                  General
                </button>
                <button
                  className={viewMode === 'regional' ? 'active' : ''}
                  onClick={() => setViewMode('regional')}
                >
                  Por Región
                </button>
              </div>
            </div>

            <div className="results-table">
              {results.map((candidate, index) => (
                <div key={candidate.id} className="result-row">
                  <div className="result-rank">#{index + 1}</div>
                  <img src={candidate.imageUrl} alt={candidate.name} className="result-avatar" />
                  <div className="result-info">
                    <h3>{candidate.name}</h3>
                    <span className="result-party">{candidate.party}</span>
                  </div>
                  <div className="result-votes">
                    <span className="votes-number">{candidate.votes.toLocaleString()}</span>
                    <span className="votes-label">votos</span>
                  </div>
                  <div className="result-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${candidate.percentage}%`,
                          background: index === 0 ? '#2563eb' : index === 1 ? '#10b981' : '#f59e0b',
                        }}
                      />
                    </div>
                    <span className="progress-percentage">{candidate.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section">
            <div className="chart-card">
              <h3>Distribución de Votos</h3>
              <div className="chart-container">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h3>Participación Electoral</h3>
              <div className="chart-container">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="participation-stats">
                <div className="participation-item">
                  <div className="participation-dot" style={{ background: '#2563eb' }} />
                  <span>Votaron: {currentElection?.totalVotes.toLocaleString()}</span>
                </div>
                <div className="participation-item">
                  <div className="participation-dot" style={{ background: '#e2e8f0' }} />
                  <span>
                    No votaron:{' '}
                    {((currentElection?.eligibleVoters || 0) - (currentElection?.totalVotes || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="security-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong>Resultados Verificables</strong>
              <p>
                Todos los votos están cifrados con RSA-4096 y pueden ser verificados de forma independiente.
                Los resultados son auditables y transparentes.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

