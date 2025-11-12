/**
 * ManageCandidates Component
 * Gestión de candidatos para elecciones
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@components/AdminLayout';
import { electionsApi } from '@services/elections.api';
import { candidatesApi } from '@services/candidates.api';
import { useToast } from '@hooks/useToast';
import { logger } from '@utils/logger';
import type { Election } from '@services/elections.api';
import type { Candidate } from '@services/candidates.api';
import '@styles/admin-shared.css';
import './ManageCandidates.css';

export function ManageCandidates() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    description: '',
    party: '',
    photoUrl: '',
  });

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      loadCandidates(selectedElection);
    }
  }, [selectedElection]);

  const loadElections = async () => {
    try {
      const data = await electionsApi.getAll();
      setElections(data);
      if (data.length > 0 && !selectedElection && data[0]) {
        setSelectedElection(data[0].id);
      }
      logger.info('Elections loaded', { count: data.length });
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
      setCandidates(data);
      logger.info('Candidates loaded', { count: data.length });
    } catch (error) {
      logger.error('Error loading candidates', error);
      showToast('error', 'Error al cargar los candidatos');
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedElection) {
      showToast('error', 'Selecciona una elección primero');
      return;
    }
    if (!newCandidate.name.trim()) {
      showToast('error', 'El nombre del candidato es requerido');
      return;
    }
    if (!newCandidate.description.trim()) {
      showToast('error', 'La descripción es requerida');
      return;
    }

    try {
      const party = newCandidate.party.trim();
      const photoUrl = newCandidate.photoUrl.trim();
      
      await candidatesApi.create({
        name: newCandidate.name.trim(),
        description: newCandidate.description.trim(),
        ...(party ? { party } : {}),
        ...(photoUrl ? { photoUrl } : {}),
        electionId: selectedElection,
      });

      showToast('success', 'Candidato agregado exitosamente');
      logger.info('Candidate added', { name: newCandidate.name });
      setShowAddModal(false);
      setNewCandidate({ name: '', description: '', party: '', photoUrl: '' });
      loadCandidates(selectedElection);
    } catch (error) {
      logger.error('Error adding candidate', error);
      showToast('error', 'Error al agregar el candidato');
    }
  };

  const selectedElectionData = elections.find(e => e.id === selectedElection);

  return (
    <AdminLayout
      title="Gestionar Candidatos"
      subtitle="Administra los candidatos de cada elección"
      actions={
        <>
          <button className="btn-secondary" onClick={() => navigate('/admin/dashboard')}>
            Volver
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddModal(true)}
            disabled={!selectedElection}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Candidato
          </button>
        </>
      }
    >
      {/* Election Selector */}
      <div className="admin-card">
        <div className="election-selector">
          <label htmlFor="electionSelect">Seleccionar Elección:</label>
          <select
            id="electionSelect"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
          >
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title} - {election.status}
              </option>
            ))}
          </select>
          {selectedElectionData && (
            <span className="election-info">
              {candidates.length} candidatos
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando candidatos...</p>
        </div>
      ) : (
        <>
          {candidates.length > 0 ? (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-card">
                  <img
                    src={candidate.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=2563eb&color=fff&size=200`}
                    alt={candidate.name}
                    className="candidate-photo"
                  />
                  <div className="candidate-info">
                    <h3>{candidate.name}</h3>
                    {candidate.party && (
                      <span className="party-badge">{candidate.party}</span>
                    )}
                    <p className="candidate-description">{candidate.description}</p>
                    <div className="candidate-stats">
                      <span className="stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="12" y1="18" x2="12" y2="12" />
                          <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        {candidate.voteCount} votos
                      </span>
                      <span className={`badge ${candidate.isActive ? 'badge-success' : 'badge-default'}`}>
                        {candidate.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>No hay candidatos</h3>
              <p>Agrega candidatos para esta elección</p>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                Agregar Primer Candidato
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Candidato</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="candidateName">Nombre *</label>
                <input
                  id="candidateName"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="candidateParty">Partido (opcional)</label>
                <input
                  id="candidateParty"
                  type="text"
                  placeholder="Ej. Partido Progresista"
                  value={newCandidate.party}
                  onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="candidateDescription">Descripción *</label>
                <textarea
                  id="candidateDescription"
                  rows={4}
                  placeholder="Describe las propuestas del candidato..."
                  value={newCandidate.description}
                  onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="candidatePhoto">URL de Foto (opcional)</label>
                <input
                  id="candidatePhoto"
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={newCandidate.photoUrl}
                  onChange={(e) => setNewCandidate({ ...newCandidate, photoUrl: e.target.value })}
                />
                <p className="help-text">
                  Si no proporcionas una foto, se generará un avatar automáticamente
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAddCandidate}>
                Agregar Candidato
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
