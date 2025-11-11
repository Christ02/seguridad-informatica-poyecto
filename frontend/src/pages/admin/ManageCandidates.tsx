/**
 * ManageCandidates Component
 * Página para gestionar candidatos de una elección
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import './ManageCandidates.css';

interface Candidate {
  id: string;
  name: string;
  description: string;
  party: string;
  imageUrl?: string;
}

export function ManageCandidates() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    category: '',
    description: '',
    image: null as File | null,
  });

  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Candidato Alfa',
      description: 'Propuestas enfocadas en la innovación tecnológica y el desarrollo sostenible para un futuro próspero.',
      party: 'Partido Innovador',
      imageUrl: 'https://ui-avatars.com/api/?name=Candidato+Alfa&background=2563eb&color=fff&size=128',
    },
    {
      id: '2',
      name: 'Opción Beta',
      description: 'Una visión centrada en la justicia social, la igualdad de oportunidades y el fortalecimiento de los...',
      party: 'Alianza Social',
    },
    {
      id: '3',
      name: 'Alternativa Gamma',
      description: 'Foco en la reforma económica, la reducción de impuestos y el fomento del libre mercado para...',
      party: 'Partido Innovador',
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewCandidate((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleAddCandidate = () => {
    console.log('Adding candidate:', newCandidate);
    setShowAddModal(false);
    // Aquí iría la lógica para agregar el candidato
  };

  return (
    <div className="manage-candidates-container">
      <Sidebar />

      <div className="manage-candidates-wrapper">
        {/* Header */}
        <header className="admin-header">
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
        <main className="candidates-main">
          <div className="page-header">
            <div>
              <h1>Gestionar Candidatos</h1>
              <p className="page-subtitle">Elecciones Presidenciales 2024</p>
            </div>
            <button className="btn-add-candidate" onClick={() => setShowAddModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Añadir Candidato
            </button>
          </div>

          <div className="candidates-content">
            {/* Left Column - Candidates List */}
            <div className="candidates-list-section">
              <div className="section-card">
                <div className="section-card-header">
                  <h2>Lista de Candidatos</h2>
                  <p>Arrastra y suelta para reordenar la lista.</p>
                </div>

                <div className="candidates-list">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="candidate-item">
                      <div className="drag-handle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="8" x2="21" y2="8" />
                          <line x1="3" y1="16" x2="21" y2="16" />
                        </svg>
                      </div>

                      {candidate.imageUrl ? (
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.name}
                          className="candidate-avatar"
                        />
                      ) : (
                        <div className="candidate-avatar-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}

                      <div className="candidate-info">
                        <h3>{candidate.name}</h3>
                        <p>{candidate.description}</p>
                        <span className="candidate-party">{candidate.party}</span>
                      </div>

                      <div className="candidate-actions">
                        <button className="btn-icon-action" title="Editar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="btn-icon-action delete" title="Eliminar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Add Candidate Form */}
            {showAddModal && (
              <div className="add-candidate-section">
                <div className="section-card">
                  <h2>Añadir Nuevo Candidato</h2>

                  <div className="form-group">
                    <label htmlFor="candidateName">Nombre del Candidato/Opción</label>
                    <input
                      id="candidateName"
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Categoría (Opcional)</label>
                    <input
                      id="category"
                      type="text"
                      placeholder="Ej: Partido Político, Agrupación"
                      value={newCandidate.category}
                      onChange={(e) => setNewCandidate((prev) => ({ ...prev, category: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      rows={4}
                      placeholder="Detalles, propuestas principales, etc."
                      value={newCandidate.description}
                      onChange={(e) => setNewCandidate((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Imagen o Logo</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="fileUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="fileUpload" className="file-upload-label">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p>Haz clic para subir o arrastra y suelta</p>
                        <span>SVG, PNG, JPG (MAX. 800x400px)</span>
                      </label>
                      {newCandidate.image && (
                        <p className="file-name">{newCandidate.image.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleAddCandidate}>
                      Guardar Candidato
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

