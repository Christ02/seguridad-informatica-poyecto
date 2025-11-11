/**
 * ManageVoters Component
 * Página para gestionar votantes del sistema
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import './ManageVoters.css';

interface Voter {
  id: string;
  name: string;
  dni: string;
  identityStatus: 'verified' | 'pending' | 'rejected';
  accountStatus: 'active' | 'inactive';
  participation: string;
}

export function ManageVoters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [voters] = useState<Voter[]>([
    {
      id: '1',
      name: 'María García López',
      dni: '12345678A',
      identityStatus: 'verified',
      accountStatus: 'active',
      participation: '2/3 elecciones',
    },
    {
      id: '2',
      name: 'Juan Martínez Pérez',
      dni: '87654321B',
      identityStatus: 'pending',
      accountStatus: 'active',
      participation: '0/1 elecciones',
    },
    {
      id: '3',
      name: 'Ana Sánchez Rodríguez',
      dni: '11223344C',
      identityStatus: 'rejected',
      accountStatus: 'inactive',
      participation: '1/1 elecciones',
    },
  ]);

  const getIdentityStatusBadge = (status: Voter['identityStatus']) => {
    const badges = {
      verified: { text: 'Verificada', class: 'status-verified' },
      pending: { text: 'Pendiente', class: 'status-pending' },
      rejected: { text: 'Rechazada', class: 'status-rejected' },
    };
    return badges[status];
  };

  const getAccountStatusBadge = (status: Voter['accountStatus']) => {
    const badges = {
      active: { text: 'Activa', class: 'status-active' },
      inactive: { text: 'Desactivada', class: 'status-inactive' },
    };
    return badges[status];
  };

  return (
    <div className="manage-voters-container">
      <Sidebar />

      <div className="manage-voters-wrapper">
        {/* Header */}
        <header className="voters-header">
          <div className="header-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#2563eb" opacity="0.2" />
              <path
                d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z"
                fill="#2563eb"
              />
            </svg>
            <span>Voting Platform</span>
          </div>

          <div className="header-user">
            <button className="btn-notification" title="Notificaciones">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div className="user-profile-badge">
              <div className="user-avatar-circle">AU</div>
              <div className="user-info-badge">
                <span className="user-name-badge">Admin User</span>
                <span className="user-email-badge">admin@gobierno.es</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 3v18m6-18v18" />
              </svg>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="voters-main">
          <div className="page-header">
            <h1>Gestión de Votantes</h1>
          </div>

          <div className="voters-toolbar">
            <div className="search-box-large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="toolbar-actions">
              <button className="btn-import">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Importar CSV
              </button>
              <button className="btn-register-voter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Registrar Votante
              </button>
            </div>
          </div>

          <div className="voters-table-container">
            <table className="voters-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>DNI</th>
                  <th>Estado de Identidad</th>
                  <th>Estado de Cuenta</th>
                  <th>Participación</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => {
                  const identityBadge = getIdentityStatusBadge(voter.identityStatus);
                  const accountBadge = getAccountStatusBadge(voter.accountStatus);
                  return (
                    <tr key={voter.id}>
                      <td className="voter-name">{voter.name}</td>
                      <td className="voter-dni">{voter.dni}</td>
                      <td>
                        <span className={`status-badge ${identityBadge.class}`}>
                          {voter.identityStatus === 'verified' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          {voter.identityStatus === 'pending' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          )}
                          {voter.identityStatus === 'rejected' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                          )}
                          {identityBadge.text}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${accountBadge.class}`}>
                          {voter.accountStatus === 'active' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="6" y="6" width="12" height="12" />
                            </svg>
                          )}
                          {accountBadge.text}
                        </span>
                      </td>
                      <td>{voter.participation}</td>
                      <td className="table-actions">
                        <button className="btn-icon-action" title="Ver perfil">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button className="btn-icon-action" title="Vincular">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </button>
                        <button className="btn-icon-action" title="Editar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <p className="pagination-info">Mostrando 1 a 10 de 97 resultados</p>
            <div className="pagination-controls">
              <button className="pagination-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <span className="pagination-dots">...</span>
              <button className="pagination-btn">8</button>
              <button className="pagination-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

