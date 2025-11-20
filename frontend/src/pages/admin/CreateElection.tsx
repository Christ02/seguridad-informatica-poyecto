/**
 * CreateElection Component
 * Página para crear y configurar nuevas elecciones - Totalmente conectada al backend
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@components/AdminLayout';
import { electionsApi, type Election, type UpdateElectionDto } from '@services/elections.api';
import { useToast } from '@hooks/useToast';
import { logger } from '@utils/logger';
import '@styles/admin-shared.css';
import './CreateElection.css';

export function CreateElection() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingElection, setEditingElection] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    votingType: 'single',
    visibility: true,
    anonymousVoting: true,
    geographicRestrictions: false,
  });

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setIsLoading(true);
      const data = await electionsApi.getAll();
      setElections(data);
      logger.info('Elections loaded', { count: data.length });
    } catch (error) {
      logger.error('Error loading elections', error);
      showToast('error', 'Error al cargar las elecciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      votingType: 'single',
      visibility: true,
      anonymousVoting: true,
      geographicRestrictions: false,
    });
    setEditingElection(null);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      showToast('error', 'El título es requerido');
      return false;
    }
    if (!formData.description.trim()) {
      showToast('error', 'La descripción es requerida');
      return false;
    }
    if (!formData.startDate) {
      showToast('error', 'La fecha y hora de inicio son requeridas');
      return false;
    }
    if (!formData.endDate) {
      showToast('error', 'La fecha y hora de fin son requeridas');
      return false;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      showToast('error', 'La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('[CreateElection] handleSubmit called');
    console.log('[CreateElection] Form data:', formData);
    
    if (!validateForm()) {
      console.log('[CreateElection] Validation failed');
      return;
    }

    try {
      setIsSubmitting(true);

      const electionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        allowMultipleVotes: formData.votingType === 'multiple',
      };

      console.log('[CreateElection] Election data to send:', electionData);

      if (editingElection) {
        // Actualizar elección existente
        console.log('[CreateElection] Updating election:', editingElection);
        await electionsApi.update(editingElection, electionData as UpdateElectionDto);
        showToast('success', 'Elección actualizada exitosamente');
        logger.info('Election updated', { id: editingElection });
      } else {
        // Crear nueva elección
        console.log('[CreateElection] Creating new election');
        const result = await electionsApi.create(electionData);
        console.log('[CreateElection] Election created successfully:', result);
        showToast('success', 'Elección creada exitosamente');
        logger.info('Election created', { title: formData.title });
      }

      resetForm();
      await loadElections();
    } catch (error: unknown) {
      logger.error('Error saving election', error);
      let errorMessage = editingElection 
        ? 'Error al actualizar la elección'
        : 'Error al crear la elección';
      
      // Extraer mensaje de error específico del backend
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        if (axiosError.response?.data?.message) {
          const msg = axiosError.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
        }
      }
      
      showToast('error', errorMessage);
      console.error('[CreateElection] Error details:', error);
      console.error('[CreateElection] Error response:', (error as any)?.response);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (election: Election) => {
    setFormData({
      title: election.title,
      description: election.description,
      startDate: new Date(election.startDate).toISOString().slice(0, 16),
      endDate: new Date(election.endDate).toISOString().slice(0, 16),
      votingType: election.allowMultipleVotes ? 'multiple' : 'single',
      visibility: true,
      anonymousVoting: true,
      geographicRestrictions: false,
    });
    setEditingElection(election.id);
    showToast('info', 'Editando elección. Modifica los campos y guarda.');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la elección "${title}"?`)) {
      return;
    }

    try {
      await electionsApi.delete(id);
      showToast('success', 'Elección eliminada exitosamente');
      logger.info('Election deleted', { id });
      await loadElections();
    } catch (error: unknown) {
      logger.error('Error deleting election', error);
      showToast('error', 'Error al eliminar la elección');
    }
  };

  const handleCancel = () => {
    if (editingElection) {
      resetForm();
      showToast('info', 'Edición cancelada');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleChangeStatus = async (electionId: string, newStatus: string, electionTitle: string) => {
    try {
      await electionsApi.updateStatus(electionId, newStatus);
      showToast('success', `Estado de "${electionTitle}" cambiado a ${newStatus}`);
      logger.info('Election status updated', { electionId, newStatus });
      await loadElections();
    } catch (error: unknown) {
      logger.error('Error updating election status', error);
      
      let errorMessage = 'Error al cambiar el estado de la elección';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      
      showToast('error', errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      ACTIVE: { text: 'Activa', class: 'status-active' },
      DRAFT: { text: 'Próxima', class: 'status-draft' },
      COMPLETED: { text: 'Finalizada', class: 'status-completed' },
      CLOSED: { text: 'Cerrada', class: 'status-closed' },
    };
    return badges[status] || { text: status, class: 'status-draft' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredElections = elections.filter((election) =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title={editingElection ? 'Editar Elección' : 'Crear Nueva Elección'}
      subtitle="Completa los detalles para configurar una nueva elección."
      actions={
        <>
          <button className="btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting 
              ? 'Guardando...' 
              : editingElection 
                ? 'Actualizar Elección' 
                : 'Guardar Elección'}
          </button>
        </>
      }
    >

        {/* Form Layout */}
        <div className="form-layout">
          {/* Left Column */}
          <div className="form-left">
            {/* Detalles de la Elección */}
            <section className="form-section">
              <h2>Detalles de la Elección</h2>
              
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ej. Elecciones Presidenciales 2024"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe el propósito de esta elección."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Fecha y Hora de Inicio</label>
                  <div className="input-with-icon">
                    <input
                      id="startDate"
                      type="datetime-local"
                      placeholder="Seleccionar fecha y hora"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Fecha y Hora de Fin</label>
                  <div className="input-with-icon">
                    <input
                      id="endDate"
                      type="datetime-local"
                      placeholder="Seleccionar fecha y hora"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* Configuración de Votación */}
            <section className="form-section">
              <h2>Configuración de Votación</h2>
              
              <div className="form-group">
                <label htmlFor="votingType">Tipo de Votación</label>
                <select
                  id="votingType"
                  value={formData.votingType}
                  onChange={(e) => handleInputChange('votingType', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="single">Candidato Único</option>
                  <option value="multiple">Múltiples Candidatos</option>
                  <option value="ranked">Votación Rankeada</option>
                </select>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="form-right">
            {/* Estado */}
            <section className="form-section">
              <h2>Estado</h2>
              
              <div className="toggle-option">
                <div className="toggle-label">
                  <span>Visibilidad</span>
                  <p>Cuando está activado, la elección será visible para los votantes elegibles.</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </section>

            {/* Opciones Avanzadas */}
            <section className="form-section">
              <h2>Opciones Avanzadas</h2>
              
              <div className="toggle-option">
                <div className="toggle-label">
                  <span>Votación anónima</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.anonymousVoting}
                    onChange={(e) => handleInputChange('anonymousVoting', e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-option">
                <div className="toggle-label">
                  <span>Restricciones geográficas</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.geographicRestrictions}
                    onChange={(e) => handleInputChange('geographicRestrictions', e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </section>
          </div>
        </div>

      {/* Elecciones Existentes */}
      <div className="admin-card">
        <div className="section-header">
          <div>
            <h2>Elecciones Existentes</h2>
            <p>Gestiona las elecciones activas y pasadas.</p>
          </div>
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar elecciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando elecciones...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>TÍTULO</th>
                  <th>ESTADO</th>
                  <th>INICIO</th>
                  <th>FIN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.length > 0 ? (
                  filteredElections.map((election) => {
                    const badge = getStatusBadge(election.status);
                    return (
                      <tr key={election.id}>
                        <td className="title-cell">{election.title}</td>
                        <td>
                          <span className={`badge ${badge.class}`}>{badge.text}</span>
                        </td>
                        <td>{formatDate(election.startDate)}</td>
                        <td>{formatDate(election.endDate)}</td>
                        <td>
                          <div className="action-buttons">
                            {election.status === 'DRAFT' && (
                              <button 
                                className="btn-action btn-activate" 
                                title="Activar elección"
                                onClick={() => handleChangeStatus(election.id, 'ACTIVE', election.title)}
                                style={{ backgroundColor: '#10b981', color: 'white' }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                            )}
                            {election.status === 'ACTIVE' && (
                              <button 
                                className="btn-action btn-close" 
                                title="Cerrar elección"
                                onClick={() => handleChangeStatus(election.id, 'CLOSED', election.title)}
                                style={{ backgroundColor: '#f59e0b', color: 'white' }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                              </button>
                            )}
                            {election.status === 'CLOSED' && (
                              <button 
                                className="btn-action btn-complete" 
                                title="Completar elección"
                                onClick={() => handleChangeStatus(election.id, 'COMPLETED', election.title)}
                                style={{ backgroundColor: '#6366f1', color: 'white' }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                              </button>
                            )}
                            {election.status === 'COMPLETED' ? (
                              <button 
                                className="btn-action btn-edit" 
                                title="Ver resultados"
                                onClick={() => navigate(`/admin/results`)}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                            ) : (
                              <>
                                <button 
                                  className="btn-action btn-edit" 
                                  title="Editar"
                                  onClick={() => handleEdit(election)}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button 
                                  className="btn-action btn-delete" 
                                  title="Eliminar"
                                  onClick={() => handleDelete(election.id, election.title)}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      {searchTerm 
                        ? 'No se encontraron elecciones que coincidan con la búsqueda'
                        : 'No hay elecciones creadas aún'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
