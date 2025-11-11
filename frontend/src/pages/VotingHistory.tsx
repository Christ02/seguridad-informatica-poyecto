/**
 * VotingHistory Component
 * Historial de votaciones del usuario
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import './VotingHistory.css';

interface VoteRecord {
  id: string;
  election: string;
  date: string;
  status: 'contabilizado' | 'anulado' | 'emitido';
}

export function VotingHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const voteRecords: VoteRecord[] = [
    {
      id: '1',
      election: 'Elecciones Presidenciales 2024',
      date: '28 de Octubre 2024, 10:30',
      status: 'contabilizado',
    },
    {
      id: '2',
      election: 'Consulta Ciudadana sobre el Parque Central',
      date: '15 de Junio 2024, 14:15',
      status: 'contabilizado',
    },
    {
      id: '3',
      election: 'Elecciones Municipales 2023',
      date: '05 de Noviembre 2023, 09:00',
      status: 'contabilizado',
    },
    {
      id: '4',
      election: 'Referéndum Constitucional 2023',
      date: '22 de Mayo 2023, 11:45',
      status: 'anulado',
    },
    {
      id: '5',
      election: 'Elecciones Legislativas 2022',
      date: '07 de Marzo 2022, 16:20',
      status: 'emitido',
    },
  ];

  const getStatusBadge = (status: VoteRecord['status']) => {
    const badges = {
      contabilizado: { text: 'Contabilizado', class: 'status-counted' },
      anulado: { text: 'Anulado', class: 'status-cancelled' },
      emitido: { text: 'Emitido', class: 'status-submitted' },
    };
    return badges[status];
  };

  const filteredRecords = voteRecords.filter((record) => {
    const matchesSearch = record.election
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="voting-history-container">
      <Sidebar />

      <main className="voting-history-main">
        <div className="voting-history-content">
          {/* Header */}
          <header className="page-header">
            <div>
              <h1>Mi Historial de Votación</h1>
              <p className="page-description">
                Aquí puedes consultar un registro de todas las elecciones en las que has
                participado y el estado de tu voto.
              </p>
            </div>
            <button className="btn-export">
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
              Exportar a PDF
            </button>
          </header>

          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar elección por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">Año</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Estado del Voto</option>
              <option value="contabilizado">Contabilizado</option>
              <option value="anulado">Anulado</option>
              <option value="emitido">Emitido</option>
            </select>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tipo de Elección</option>
              <option value="presidencial">Presidencial</option>
              <option value="municipal">Municipal</option>
              <option value="consulta">Consulta</option>
            </select>
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <h3>Privacidad y Confidencialidad</h3>
              <p>
                Su voto es secreto y anónimo. Este historial solo confirma su participación en
                las elecciones, no la selección que realizó.
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="voting-table">
              <thead>
                <tr>
                  <th>ELECCIÓN</th>
                  <th>FECHA DE PARTICIPACIÓN</th>
                  <th>ESTADO DEL VOTO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const badge = getStatusBadge(record.status);
                  return (
                    <tr key={record.id}>
                      <td className="election-name">{record.election}</td>
                      <td className="date-cell">{record.date}</td>
                      <td>
                        <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                      </td>
                      <td>
                        <button className="btn-details">Ver Detalles</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <p className="pagination-info">Mostrando 1 a 5 de 23 resultados</p>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={currentPage === 1}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <span className="pagination-dots">...</span>
              <button className="pagination-btn">5</button>
              <button className="pagination-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

