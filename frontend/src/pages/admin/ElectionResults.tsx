/**
 * ElectionResults Component
 * Página para visualizar resultados de elecciones
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import './ElectionResults.css';

interface ResultsByRegion {
  region: string;
  candidateA: number;
  candidateAPercent: number;
  candidateB: number;
  candidateBPercent: number;
  candidateC: number;
  candidateCPercent: number;
  others: number;
  total: number;
  participation: number;
}

export function ElectionResults() {
  const [selectedElection, setSelectedElection] = useState('presidencial');
  const [selectedRegion, setSelectedRegion] = useState('todas');
  const [selectedAge, setSelectedAge] = useState('todos');

  const totalResults = {
    candidateA: { votes: 1125450, percent: 45 },
    candidateB: { votes: 875350, percent: 35 },
    candidateC: { votes: 375150, percent: 15 },
    others: { votes: 125050, percent: 5 },
    total: 2501000,
    participation: 65.2,
    totalVoters: 3835890,
    votedCount: 2501000,
  };

  const resultsByRegion: ResultsByRegion[] = [
    {
      region: 'Región Capital',
      candidateA: 540210,
      candidateAPercent: 48,
      candidateB: 393750,
      candidateBPercent: 35,
      candidateC: 135045,
      candidateCPercent: 12,
      others: 56255,
      total: 1125260,
      participation: 71.3,
    },
    {
      region: 'Provincia Norte',
      candidateA: 337635,
      candidateAPercent: 42,
      candidateB: 281362,
      candidateBPercent: 35,
      candidateC: 120584,
      candidateCPercent: 15,
      others: 64419,
      total: 804000,
      participation: 62.0,
    },
    {
      region: 'Provincia Sur',
      candidateA: 247605,
      candidateAPercent: 43,
      candidateB: 200238,
      candidateBPercent: 35,
      candidateC: 119521,
      candidateCPercent: 21,
      others: 4376,
      total: 571740,
      participation: 59.5,
    },
  ];

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
  };

  const handleExportCSV = () => {
    console.log('Exporting to CSV...');
  };

  return (
    <div className="election-results-container">
      <Sidebar />

      <div className="election-results-wrapper">
        {/* Header */}
        <header className="results-header">
          <h1>Panel de Administración</h1>
          <div className="header-actions">
            <div className="search-box-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Buscar..." />
            </div>
            <button className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m6-12h-6m-6 0H1m17.66 5.34l-4.24 4.24m0-8.48l4.24 4.24M6.34 6.34l4.24 4.24m0 0l-4.24 4.24" />
              </svg>
            </button>
            <div className="admin-user-info">
              <img
                src="https://ui-avatars.com/api/?name=Admin+Name&background=2563eb&color=fff"
                alt="Avatar"
                className="admin-avatar"
              />
              <div className="admin-user-details">
                <span className="admin-user-name">Admin Name</span>
                <span className="admin-user-role">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="results-main">
          <div className="page-header">
            <div>
              <h1>Resultados: Elecciones Presidenciales 2024</h1>
              <p className="live-update">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" fill="#dc2626" />
                </svg>
                En vivo: Actualizado hace 2 minutos
              </p>
            </div>
            <div className="export-actions">
              <button className="btn-export-pdf" onClick={handleExportPDF}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Exportar PDF
              </button>
              <button className="btn-export-csv" onClick={handleExportCSV}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Elección</label>
              <select value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
                <option value="presidencial">Elecciones Presidenciales</option>
                <option value="municipal">Elecciones Municipales</option>
                <option value="referendum">Referéndum</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Región/Provincia</label>
              <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                <option value="todas">Todas</option>
                <option value="capital">Región Capital</option>
                <option value="norte">Provincia Norte</option>
                <option value="sur">Provincia Sur</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Grupo de Edad</label>
              <select value={selectedAge} onChange={(e) => setSelectedAge(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="18-30">18-30 años</option>
                <option value="31-50">31-50 años</option>
                <option value="51+">51+ años</option>
              </select>
            </div>

            <button className="btn-apply-filters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Aplicar Filtros
            </button>
          </div>

          {/* Results Grid */}
          <div className="results-grid">
            {/* Votes by Candidate */}
            <div className="results-card votes-card">
              <h2>Votos por Candidato</h2>
              <div className="votes-list">
                <div className="vote-item">
                  <div className="vote-info">
                    <span className="candidate-name">Candidato A</span>
                    <div className="vote-bar">
                      <div className="vote-fill" style={{ width: `${totalResults.candidateA.percent}%`, background: '#2563eb' }}></div>
                    </div>
                  </div>
                  <div className="vote-stats">
                    <span className="vote-percent">{totalResults.candidateA.percent}%</span>
                    <span className="vote-count">{totalResults.candidateA.votes.toLocaleString('es-ES')}</span>
                  </div>
                </div>

                <div className="vote-item">
                  <div className="vote-info">
                    <span className="candidate-name">Candidato B</span>
                    <div className="vote-bar">
                      <div className="vote-fill" style={{ width: `${totalResults.candidateB.percent}%`, background: '#10b981' }}></div>
                    </div>
                  </div>
                  <div className="vote-stats">
                    <span className="vote-percent">{totalResults.candidateB.percent}%</span>
                    <span className="vote-count">{totalResults.candidateB.votes.toLocaleString('es-ES')}</span>
                  </div>
                </div>

                <div className="vote-item">
                  <div className="vote-info">
                    <span className="candidate-name">Candidato C</span>
                    <div className="vote-bar">
                      <div className="vote-fill" style={{ width: `${totalResults.candidateC.percent}%`, background: '#ef4444' }}></div>
                    </div>
                  </div>
                  <div className="vote-stats">
                    <span className="vote-percent">{totalResults.candidateC.percent}%</span>
                    <span className="vote-count">{totalResults.candidateC.votes.toLocaleString('es-ES')}</span>
                  </div>
                </div>

                <div className="vote-item">
                  <div className="vote-info">
                    <span className="candidate-name">Otros/Nulos</span>
                    <div className="vote-bar">
                      <div className="vote-fill" style={{ width: `${totalResults.others.percent}%`, background: '#6b7280' }}></div>
                    </div>
                  </div>
                  <div className="vote-stats">
                    <span className="vote-percent">{totalResults.others.percent}%</span>
                    <span className="vote-count">{totalResults.others.votes.toLocaleString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participation Donut */}
            <div className="results-card participation-card">
              <h2>Distribución de Votos</h2>
              <div className="donut-chart">
                <svg viewBox="0 0 200 200" className="donut-svg">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="40"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="40"
                    strokeDasharray={`${2 * Math.PI * 80 * (totalResults.participation / 100)} ${2 * Math.PI * 80}`}
                    strokeDashoffset={2 * Math.PI * 80 * 0.25}
                    style={{ transition: 'stroke-dasharray 0.5s' }}
                  />
                </svg>
                <div className="donut-center">
                  <span className="donut-percent">{totalResults.participation}%</span>
                  <span className="donut-label">Tasa de Participación</span>
                </div>
              </div>
              <p className="participation-details">
                {totalResults.votedCount.toLocaleString('es-ES')} / {totalResults.totalVoters.toLocaleString('es-ES')} Votantes
              </p>
            </div>
          </div>

          {/* Results by Region */}
          <div className="results-card results-table-card">
            <h2>Resultados Detallados por Región</h2>
            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>REGIÓN</th>
                    <th>CANDIDATO A (VOTOS)</th>
                    <th>CANDIDATO B (VOTOS)</th>
                    <th>CANDIDATO C (VOTOS)</th>
                    <th>OTROS/NULOS</th>
                    <th>TOTAL VOTOS</th>
                    <th>PARTICIPACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsByRegion.map((region) => (
                    <tr key={region.region}>
                      <td className="region-name">{region.region}</td>
                      <td>
                        {region.candidateA.toLocaleString('es-ES')}
                        <span className="percent-badge blue">({region.candidateAPercent}%)</span>
                      </td>
                      <td>
                        {region.candidateB.toLocaleString('es-ES')}
                        <span className="percent-badge green">({region.candidateBPercent}%)</span>
                      </td>
                      <td>
                        {region.candidateC.toLocaleString('es-ES')}
                        <span className="percent-badge red">({region.candidateCPercent}%)</span>
                      </td>
                      <td>{region.others.toLocaleString('es-ES')}</td>
                      <td className="total-votes">{region.total.toLocaleString('es-ES')}</td>
                      <td className="participation-cell">{region.participation}%</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td className="region-name">Total Nacional</td>
                    <td>
                      {totalResults.candidateA.votes.toLocaleString('es-ES')}
                      <span className="percent-badge blue">({totalResults.candidateA.percent}%)</span>
                    </td>
                    <td>
                      {totalResults.candidateB.votes.toLocaleString('es-ES')}
                      <span className="percent-badge green">({totalResults.candidateB.percent}%)</span>
                    </td>
                    <td>
                      {totalResults.candidateC.votes.toLocaleString('es-ES')}
                      <span className="percent-badge red">({totalResults.candidateC.percent}%)</span>
                    </td>
                    <td>{totalResults.others.votes.toLocaleString('es-ES')}</td>
                    <td className="total-votes">{totalResults.total.toLocaleString('es-ES')}</td>
                    <td className="participation-cell">{totalResults.participation}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

