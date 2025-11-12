/**
 * ManageVoters Component
 * Página para gestionar votantes del sistema
 */

import { useState, useEffect } from 'react';
import { AdminLayout } from '@components/AdminLayout';
import { adminApi, type UserItem, type UserDetails } from '@services/admin.api';
import { useToast } from '@hooks/useToast';
import { logger } from '@utils/logger';
import '@styles/admin-shared.css';
import './ManageVoters.css';

export function ManageVoters() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [voters, setVoters] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const limit = 50; // Obtener más usuarios por página

  // Estadísticas calculadas
  const stats = {
    totalUsers: total,
    verifiedUsers: voters.filter(v => v.isVerified).length,
    activeUsers: voters.filter(v => v.isActive).length,
    pendingVerification: voters.filter(v => !v.isVerified).length,
  };

  useEffect(() => {
    loadVoters();
  }, [page]);

  const loadVoters = async () => {
    try {
      setLoading(true);
      // Obtener todos los usuarios desde el backend
      const response = await adminApi.getUsers({
        page,
        limit,
      });
      
      setVoters(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      
      logger.info('Voters loaded from backend', { 
        count: response.data.length,
        total: response.pagination.total,
        page 
      });
    } catch (error) {
      logger.error('Error loading voters', error);
      showToast('error', 'Error al cargar los votantes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const userDetails = await adminApi.getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowDetailsModal(true);
      logger.info('User details loaded', { userId });
    } catch (error) {
      logger.error('Error loading user details', error);
      showToast('error', 'Error al cargar los detalles del usuario');
    }
  };

  const handleEditUser = (user: UserItem) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      showToast('success', 'Rol actualizado correctamente');
      await loadVoters();
      setShowEditModal(false);
    } catch (error) {
      logger.error('Error updating user role', error);
      showToast('error', 'Error al actualizar el rol del usuario');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, !currentStatus);
      showToast('success', `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      await loadVoters();
    } catch (error) {
      logger.error('Error toggling user status', error);
      showToast('error', 'Error al cambiar el estado del usuario');
    }
  };

  const getIdentityStatusBadge = (isVerified: boolean) => {
    return isVerified
      ? { text: 'Verificado', class: 'badge-success' }
      : { text: 'Pendiente', class: 'badge-warning' };
  };

  const getAccountStatusBadge = (isActive: boolean) => {
    return isActive
      ? { text: 'Activa', class: 'badge-success' }
      : { text: 'Inactiva', class: 'badge-default' };
  };

  const filteredVoters = voters.filter((voter) => {
    // Filtro de búsqueda
    const matchesSearch = 
      voter.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.dpi.includes(searchQuery);
    
    // Filtro de rol
    const matchesRole = !roleFilter || voter.role === roleFilter;
    
    // Filtro de verificación
    const matchesVerified = 
      !verifiedFilter ||
      (verifiedFilter === 'verified' && voter.isVerified) ||
      (verifiedFilter === 'pending' && !voter.isVerified);
    
    return matchesSearch && matchesRole && matchesVerified;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout
      title="Gestionar Usuarios"
      subtitle="Administra y monitorea todos los usuarios del sistema"
      actions={
        <>
          <button className="btn-secondary" onClick={() => loadVoters()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Actualizar
          </button>
        </>
      }
    >
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <>
          {/* Estadísticas */}
          <div className="voters-stats">
            <div className="stat-card-small">
              <div className="stat-label">Total de Usuarios</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-description">Registrados en el sistema</div>
            </div>
            <div className="stat-card-small">
              <div className="stat-label">Verificados</div>
              <div className="stat-value">{stats.verifiedUsers}</div>
              <div className="stat-description">Identidad confirmada</div>
            </div>
            <div className="stat-card-small">
              <div className="stat-label">Activos</div>
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-description">Cuentas habilitadas</div>
            </div>
            <div className="stat-card-small">
              <div className="stat-label">Pendientes</div>
              <div className="stat-value">{stats.pendingVerification}</div>
              <div className="stat-description">Verificación pendiente</div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="voters-filters">
            <div className="filter-group" style={{ flex: 1 }}>
              <label htmlFor="search">Buscar</label>
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar por nombre, DPI o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="roleFilter">Rol</label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todos los roles</option>
                <option value="VOTER">Votante</option>
                <option value="ADMIN">Administrador</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="verifiedFilter">Verificación</label>
              <select
                id="verifiedFilter"
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="verified">Verificados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="voters-table-wrapper">
            <div className="table-header">
              <h3>Lista de Usuarios ({filteredVoters.length})</h3>
              <div className="table-actions">
                <button className="btn-secondary" onClick={() => window.print()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Imprimir
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>USUARIO</th>
                    <th>DPI</th>
                    <th>ROL</th>
                    <th>ESTADO</th>
                    <th>ÚLTIMO ACCESO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.length > 0 ? (
                    filteredVoters.map((voter) => {
                      const identityBadge = getIdentityStatusBadge(voter.isVerified);
                      const accountBadge = getAccountStatusBadge(voter.isActive);
                      
                      return (
                        <tr key={voter.id}>
                          <td>
                            <div className="user-info-expanded">
                              <div className="user-avatar-large">
                                {voter.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="user-details">
                                <div className="user-name">{voter.fullName}</div>
                                <div className="user-email">{voter.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {voter.dpi}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              voter.role === 'ADMIN' ? 'badge-warning' :
                              voter.role === 'AUDITOR' ? 'badge-info' :
                              'badge-default'
                            }`}>
                              {voter.role}
                            </span>
                          </td>
                          <td>
                            <div className="user-status-cell">
                              <span className={`badge ${identityBadge.class}`}>
                                {voter.isVerified ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                )}
                                {identityBadge.text}
                              </span>
                              <span className={`badge ${accountBadge.class}`}>
                                {accountBadge.text}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {formatDate(voter.lastLoginAt)}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-action btn-edit" 
                                title="Ver detalles"
                                onClick={() => handleViewDetails(voter.id)}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button 
                                className="btn-action" 
                                title="Editar usuario"
                                onClick={() => handleEditUser(voter)}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              {voter.isActive ? (
                                <button 
                                  className="btn-action btn-delete" 
                                  title="Desactivar"
                                  onClick={() => handleToggleUserStatus(voter.id, voter.isActive)}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                  </svg>
                                </button>
                              ) : (
                                <button 
                                  className="btn-action btn-activate" 
                                  title="Activar"
                                  onClick={() => handleToggleUserStatus(voter.id, voter.isActive)}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state-custom">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          <h3>
                            {searchQuery || roleFilter || verifiedFilter
                              ? 'No se encontraron usuarios'
                              : 'No hay usuarios registrados'}
                          </h3>
                          <p>
                            {searchQuery || roleFilter || verifiedFilter
                              ? 'Intenta ajustar los filtros de búsqueda'
                              : 'Los usuarios aparecerán aquí cuando se registren'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} usuarios
              </div>
              <div className="pagination-controls">
                <button 
                  className="btn-secondary" 
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className="pagination-info">
                  Página {page} de {totalPages}
                </span>
                <button 
                  className="btn-secondary" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalles del Usuario */}
      {showDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Usuario</h3>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details-modal">
                <div className="user-header-modal">
                  <div className="user-avatar-large">
                    {selectedUser.user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{selectedUser.user.fullName}</h4>
                    <p className="user-email">{selectedUser.user.email}</p>
                  </div>
                </div>

                <div className="user-info-grid">
                  <div className="info-item">
                    <span className="info-label">DPI</span>
                    <span className="info-value">{selectedUser.user.dpi}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Rol</span>
                    <span className={`badge ${
                      selectedUser.user.role === 'ADMIN' ? 'badge-warning' :
                      selectedUser.user.role === 'AUDITOR' ? 'badge-info' :
                      'badge-default'
                    }`}>
                      {selectedUser.user.role}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Estado</span>
                    <span className={`badge ${selectedUser.user.isActive ? 'badge-success' : 'badge-default'}`}>
                      {selectedUser.user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Verificación</span>
                    <span className={`badge ${selectedUser.user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                      {selectedUser.user.isVerified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                <div className="stats-section">
                  <h4>Estadísticas de Votación</h4>
                  <div className="stats-grid-modal">
                    <div className="stat-item-modal">
                      <span className="stat-label-modal">Total de Votos</span>
                      <span className="stat-value-modal">{selectedUser.stats.totalVotes}</span>
                    </div>
                    {selectedUser.stats.lastVote && (
                      <div className="stat-item-modal">
                        <span className="stat-label-modal">Último Voto</span>
                        <span className="stat-value-modal">{selectedUser.stats.lastVote.electionTitle}</span>
                        <span className="stat-detail-modal">
                          {new Date(selectedUser.stats.lastVote.timestamp).toLocaleString('es-GT')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedUser.recentActivity.length > 0 && (
                  <div className="activity-section">
                    <h4>Actividad Reciente</h4>
                    <div className="activity-list-modal">
                      {selectedUser.recentActivity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="activity-item-modal">
                          <div className="activity-content">
                            <span className="activity-type">{activity.eventType}</span>
                            <span className="activity-action">{activity.action}</span>
                          </div>
                          <span className="activity-time">
                            {new Date(activity.timestamp).toLocaleString('es-GT', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Usuario */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-user-form">
                <div className="user-header-modal">
                  <div className="user-avatar-large">
                    {editingUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{editingUser.fullName}</h4>
                    <p className="user-email">{editingUser.email}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userRole">Rol del Usuario</label>
                  <select
                    id="userRole"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  >
                    <option value="VOTER">Votante</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="SUPER_ADMIN">Super Administrador</option>
                  </select>
                  <p className="help-text">
                    Cambiar el rol afectará los permisos del usuario en el sistema
                  </p>
                </div>

                <div className="info-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <p><strong>Información sobre roles:</strong></p>
                    <ul>
                      <li><strong>Votante:</strong> Puede participar en elecciones</li>
                      <li><strong>Administrador:</strong> Puede gestionar elecciones y usuarios</li>
                      <li><strong>Auditor:</strong> Puede revisar logs y auditorías</li>
                      <li><strong>Super Admin:</strong> Acceso completo al sistema</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={() => handleUpdateUserRole(editingUser.id, editingUser.role)}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
