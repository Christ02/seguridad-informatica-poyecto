/**
 * AdminVotesHistory Component
 * Historial completo de votaciones con filtros avanzados
 */

import { useState, useEffect } from 'react';
import { AdminLayout } from '@components/AdminLayout';
import { adminApi } from '@services/admin.api';
import type { VoteHistoryResponse, VoteHistoryItem } from '@services/admin.api';
import { useToast } from '@hooks/useToast';
import { logger } from '@utils/logger';
import '@styles/admin-shared.css';
import './AdminVotesHistory.css';

export function AdminVotesHistory() {
  const { showToast } = useToast();
  
  const [votes, setVotes] = useState<VoteHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchVotes();
  }, [currentPage, statusFilter]);

  const fetchVotes = async () => {
    setIsLoading(true);
    try {
      const response: VoteHistoryResponse = await adminApi.getVotesHistory({
        page: currentPage,
        limit: 15,
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { startDate: dateFrom }),
        ...(dateTo && { endDate: dateTo }),
      });

      setVotes(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
      logger.info('Votes history loaded', { total: response.pagination.total });
    } catch (error: any) {
      logger.error('Error fetching votes history', error);
      showToast('error', 'Error al cargar el historial de votos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchVotes();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredVotes = votes.filter((vote) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vote.electionTitle.toLowerCase().includes(query) ||
      vote.candidateName.toLowerCase().includes(query) ||
      vote.voterName.toLowerCase().includes(query) ||
      vote.voterEmail.toLowerCase().includes(query)
    );
  });

  return (
    <AdminLayout
      title="Historial de Votaciones"
      subtitle="Consulta y analiza todas las votaciones registradas en el sistema"
      actions={
        <button className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar CSV
      </button>
    }
  >
    {/* Filtros */}
    <div className="admin-card">
      <div className="filters-row">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por elección, candidato o votante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-group"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="valid">Válidos</option>
          <option value="invalid">Inválidos</option>
        </select>

        <input
          type="date"
          className="form-group"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="Desde"
        />

        <input
          type="date"
          className="form-group"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="Hasta"
        />

        <button className="btn-secondary" onClick={handleSearch}>
          Filtrar
        </button>

        {(statusFilter || dateFrom || dateTo || searchQuery) && (
          <button
            className="btn-secondary"
            onClick={() => {
              setStatusFilter('');
              setDateFrom('');
              setDateTo('');
              setSearchQuery('');
              setCurrentPage(1);
            }}
          >
            Limpiar
          </button>
        )}
      </div>
    </div>

    {/* Estadísticas */}
    <div className="admin-card">
      <div className="grid-3-cols">
        <div className="stat-box">
          <div className="stat-label">Total de votos</div>
          <div className="stat-value">{total.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Página</div>
          <div className="stat-value">{currentPage} de {totalPages}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Mostrando</div>
          <div className="stat-value">{filteredVotes.length} votos</div>
        </div>
      </div>
    </div>

    {/* Tabla */}
    {isLoading ? (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando historial de votos...</p>
      </div>
    ) : filteredVotes.length > 0 ? (
      <div className="admin-card">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ELECCIÓN</th>
                <th>CANDIDATO</th>
                <th>VOTANTE</th>
                <th>HASH DE VOTO</th>
                <th>ESTADO</th>
                <th>FECHA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredVotes.map((vote) => (
                <tr key={vote.id}>
                  <td className="title-cell">{vote.electionTitle}</td>
                  <td>{vote.candidateName}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{vote.voterName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{vote.voterEmail}</div>
                    </div>
                  </td>
                  <td>
                    <code style={{ 
                      background: '#f3f4f6', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}>
                      {vote.voteHash.substring(0, 16)}...
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${vote.isValid ? 'badge-success' : 'badge-danger'}`}>
                      {vote.isValid ? 'Válido' : 'Inválido'}
                    </span>
                  </td>
                  <td>
                    {new Date(vote.timestamp).toLocaleString('es-GT', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-edit" title="Ver detalles">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <h3>No se encontraron votos</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </div>
    )}

    {/* Paginación */}
    {totalPages > 1 && (
      <div className="pagination">
        <button
          className="btn-secondary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Anterior
        </button>

        <div className="pagination-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          className="btn-secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    )}
  </AdminLayout>
);
}

