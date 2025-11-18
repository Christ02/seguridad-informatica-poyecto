/**
 * VotingHistory Component
 * Historial de votaciones del usuario - Conectado al backend
 */

import { useState, useEffect } from 'react';
import { Sidebar } from '@components/Sidebar';
import { VoteReceiptModal } from '@components/VoteReceiptModal';
import { useToast } from '@hooks/useToast';
import { votesApi } from '@services/votes.api';
import { generateVotingHistoryPDF, generateVoteReceiptPDF } from '@utils/pdfGenerator';
import type { VoteHistory as VoteHistoryItem } from '@services/votes.api';
import './VotingHistory.css';

export function VotingHistory() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [voteRecords, setVoteRecords] = useState<VoteHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVote, setSelectedVote] = useState<VoteHistoryItem | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVotingHistory();
  }, []);

  const fetchVotingHistory = async () => {
    setIsLoading(true);
    try {
      const history = await votesApi.getHistory();
      setVoteRecords(history);
    } catch (error: any) {
      console.error('Error al obtener historial de votación:', error);
      // Si el error es 401 (no autorizado), mostrar mensaje diferente
      if (error.response?.status === 401) {
        showToast('error', 'Sesión expirada. Por favor inicia sesión nuevamente');
      } else {
        showToast('error', 'Error al cargar el historial de votación');
      }
      setVoteRecords([]); // Asegurar que se muestre el mensaje de "no hay votaciones"
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: VoteHistoryItem['status']) => {
    const badges = {
      contabilizado: { text: 'Contabilizado', class: 'status-counted' },
      anulado: { text: 'Anulado', class: 'status-cancelled' },
      emitido: { text: 'Emitido', class: 'status-submitted' },
    };
    return badges[status];
  };

  const filteredRecords = voteRecords.filter((record) => {
    const matchesSearch = record.electionTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesYear = !yearFilter || new Date(record.votedAt).getFullYear().toString() === yearFilter;
    
    const matchesStatus = !statusFilter || record.status === statusFilter;

    return matchesSearch && matchesYear && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    try {
      if (filteredRecords.length === 0) {
        showToast('warning', 'No hay registros para exportar');
        return;
      }
      generateVotingHistoryPDF(filteredRecords);
      showToast('success', 'PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      showToast('error', 'Error al generar el PDF');
    }
  };

  const handleViewDetails = (record: VoteHistoryItem) => {
    setSelectedVote(record);
  };

  const handleCloseModal = () => {
    setSelectedVote(null);
  };

  const handleDownloadReceipt = (vote: VoteHistoryItem) => {
    try {
      generateVoteReceiptPDF(vote);
      showToast('success', 'Recibo descargado exitosamente');
    } catch (error) {
      console.error('Error generando recibo:', error);
      showToast('error', 'Error al generar el recibo');
    }
  };

  if (isLoading) {
    return (
      <div className="voting-history-container">
        <Sidebar />
        <main className="voting-history-main">
          <div className="loading-spinner"></div>
          <p>Cargando historial de votación...</p>
        </main>
      </div>
    );
  }

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
            <button className="btn-export" onClick={handleExport}>
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

          {/* Info Box */}
          <div className="page-info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p>Todos tus votos están verificados criptográficamente y son completamente anónimos</p>
          </div>

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
              {Array.from(new Set(voteRecords.map(r => new Date(r.votedAt).getFullYear()))).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
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
            {filteredRecords.length === 0 ? (
              <div className="no-records-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <h3>No hay votaciones registradas</h3>
                <p>Aún no has participado en ninguna elección.</p>
                <p>Cuando emitas tu primer voto, aparecerá aquí.</p>
              </div>
            ) : (
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
                  {paginatedRecords.map((record) => {
                    const badge = getStatusBadge(record.status);
                    const date = new Date(record.votedAt);
                    return (
                      <tr key={record.id}>
                        <td className="election-name">{record.electionTitle}</td>
                        <td className="date-cell">
                          {date.toLocaleDateString('es-GT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                        </td>
                        <td>
                          <button className="btn-details" onClick={() => handleViewDetails(record)}>
                            Ver Recibo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="pagination">
              <p className="pagination-info">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                {Math.min(currentPage * itemsPerPage, filteredRecords.length)} de {filteredRecords.length} resultados
              </p>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Recibo */}
      {selectedVote && (
        <VoteReceiptModal vote={selectedVote} onClose={handleCloseModal} />
      )}
    </div>
  );
}
