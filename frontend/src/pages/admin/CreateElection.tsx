/**
 * CreateElection Component
 * Página para crear y configurar nuevas elecciones
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@components/Sidebar';
import './CreateElection.css';

export function CreateElection() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    votingType: 'single',
    visibility: true,
    anonymousVoting: true,
    geographicRestrictions: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Creating election:', formData);
    // Aquí iría la lógica para guardar la elección
    navigate('/admin/elections');
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="create-election-container">
      <Sidebar />

      <div className="create-election-wrapper">
        {/* Header */}
        <header className="create-election-header">
          <div className="header-top">
            <div className="header-nav">
              <span className="nav-brand">🗳️ Plataforma de Votación</span>
              <nav className="nav-links">
                <a href="/admin/dashboard">Dashboard</a>
                <a href="/admin/elections" className="active">Elecciones</a>
                <a href="/admin/voters">Usuarios</a>
                <a href="/admin/results">Resultados</a>
              </nav>
            </div>
            <div className="header-user">
              <button className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              <div className="user-avatar-small">
                <span>Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="create-election-main">
          <div className="page-header">
            <div>
              <h1>Crear Nueva Elección</h1>
              <p className="page-subtitle">Completa los detalles para configurar una nueva elección.</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Guardar Elección
              </button>
            </div>
          </div>

          <div className="form-layout">
            {/* Left Column - Detalles */}
            <div className="form-column">
              <div className="form-card">
                <h2>Detalles de la Elección</h2>

                <div className="form-group">
                  <label htmlFor="title">Título</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Ej. Elecciones Presidenciales 2024"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
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
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Fecha y Hora de Inicio</label>
                    <div className="date-time-input">
                      <input
                        id="startDate"
                        type="datetime-local"
                        value={`${formData.startDate}T${formData.startTime}`}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split('T');
                          handleInputChange('startDate', date);
                          handleInputChange('startTime', time);
                        }}
                      />
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">Fecha y Hora de Fin</label>
                    <div className="date-time-input">
                      <input
                        id="endDate"
                        type="datetime-local"
                        value={`${formData.endDate}T${formData.endTime}`}
                        onChange={(e) => {
                          const [date, time] = e.target.value.split('T');
                          handleInputChange('endDate', date);
                          handleInputChange('endTime', time);
                        }}
                      />
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <h2>Configuración de Votación</h2>

                <div className="form-group">
                  <label htmlFor="votingType">Tipo de Votación</label>
                  <select
                    id="votingType"
                    value={formData.votingType}
                    onChange={(e) => handleInputChange('votingType', e.target.value)}
                  >
                    <option value="single">Candidato Único</option>
                    <option value="multiple">Múltiples Candidatos</option>
                    <option value="ranked">Votación Clasificada</option>
                    <option value="approval">Votación por Aprobación</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column - Estado y Opciones */}
            <div className="form-column">
              <div className="form-card">
                <h2>Estado</h2>

                <div className="toggle-group">
                  <div className="toggle-item">
                    <div>
                      <label>Visibilidad</label>
                      <p className="toggle-description">
                        Cuando está activado, la elección será visible para los votantes elegibles.
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.visibility}
                        onChange={(e) => handleInputChange('visibility', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <h2>Opciones Avanzadas</h2>

                <div className="toggle-group">
                  <div className="toggle-item">
                    <div>
                      <label>Votación anónima</label>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.anonymousVoting}
                        onChange={(e) => handleInputChange('anonymousVoting', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div>
                      <label>Restricciones geográficas</label>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.geographicRestrictions}
                        onChange={(e) => handleInputChange('geographicRestrictions', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Elections */}
          <div className="existing-elections-section">
            <div className="section-header">
              <div>
                <h2>Elecciones Existentes</h2>
                <p className="section-subtitle">Gestiona las elecciones activas y pasadas.</p>
              </div>
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" placeholder="Buscar elecciones..." />
              </div>
            </div>

            <table className="elections-table">
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
                <tr>
                  <td>Elecciones Regionales 2023</td>
                  <td><span className="status-badge status-active">Activa</span></td>
                  <td>01 Oct 2023, 09:00</td>
                  <td>15 Oct 2023, 18:00</td>
                  <td className="table-actions">
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
                  </td>
                </tr>
                <tr>
                  <td>Consulta Popular sobre Urbanismo</td>
                  <td><span className="status-badge status-completed">Finalizada</span></td>
                  <td>10 Ago 2023, 08:00</td>
                  <td>12 Ago 2023, 20:00</td>
                  <td className="table-actions">
                    <button className="btn-icon-action" title="Ver">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Presupuestos Participativos 2024</td>
                  <td><span className="status-badge status-upcoming">Próxima</span></td>
                  <td>01 Feb 2024, 09:00</td>
                  <td>28 Feb 2024, 23:59</td>
                  <td className="table-actions">
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>

        {/* Footer */}
        <footer className="create-election-footer">
          <p>© 2024 Entidad Gubernamental. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}

