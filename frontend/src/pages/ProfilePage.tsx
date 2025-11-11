/**
 * ProfilePage Component
 * Página de perfil de usuario con configuración de seguridad
 */

import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Sidebar } from '@components/Sidebar';
import './ProfilePage.css';

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '+57 300 123 4567',
    address: 'Calle 123 #45-67, Bogotá',
  });

  const devices = [
    { id: '1', name: 'MacBook Pro', lastActive: 'Activo ahora', location: 'Bogotá, Colombia' },
    { id: '2', name: 'iPhone 13', lastActive: 'Hace 2 horas', location: 'Bogotá, Colombia' },
    { id: '3', name: 'Chrome en Windows', lastActive: 'Hace 5 días', location: 'Medellín, Colombia' },
  ];

  const activityLog = [
    { id: '1', action: 'Inicio de sesión', date: '2025-11-11 14:30', ip: '192.168.1.1' },
    { id: '2', action: 'Voto emitido', date: '2025-11-10 09:15', ip: '192.168.1.1' },
    { id: '3', action: 'Cambio de contraseña', date: '2025-11-05 16:45', ip: '192.168.1.1' },
    { id: '4', action: 'Configuración MFA', date: '2025-11-01 10:20', ip: '192.168.1.1' },
  ];

  const handleSave = () => {
    console.log('Guardando cambios:', formData);
    setIsEditing(false);
  };

  const handleRevokeDevice = (deviceId: string) => {
    console.log('Revocando dispositivo:', deviceId);
  };

  return (
    <div className="profile-page-container">
      <Sidebar />

      <div className="profile-page-wrapper">
        <header className="profile-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y configuración de seguridad</p>
        </header>

        <main className="profile-main">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="profile-avatar-info">
                <h2>Ciudadano Votante</h2>
                <span className="profile-id">ID: 1234567890</span>
                <span className="profile-badge">Cuenta Verificada</span>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-section">
                <h3>Información Personal</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>Dirección</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                {isEditing ? (
                  <>
                    <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                      Guardar Cambios
                    </button>
                  </>
                ) : (
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    Editar Información
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="security-section">
            <h2>Configuración de Seguridad</h2>
            <div className="security-cards">
              <div className="security-card">
                <div className="security-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="security-card-content">
                  <h3>Cambiar Contraseña</h3>
                  <p>Actualiza tu contraseña regularmente para mayor seguridad</p>
                </div>
                <button className="btn-security-action">Cambiar</button>
              </div>

              <div className="security-card">
                <div className="security-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="security-card-content">
                  <h3>Autenticación de Dos Factores</h3>
                  <p>Protege tu cuenta con un segundo factor de autenticación</p>
                </div>
                <button className="btn-security-action" onClick={() => setShowMFASetup(!showMFASetup)}>
                  {showMFASetup ? 'Cancelar' : 'Configurar'}
                </button>
              </div>

              <div className="security-card">
                <div className="security-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="security-card-content">
                  <h3>Preferencias de Notificaciones</h3>
                  <p>Configura cómo y cuándo recibes notificaciones</p>
                </div>
                <button className="btn-security-action">Gestionar</button>
              </div>
            </div>
          </div>

          {/* Devices */}
          <div className="devices-section">
            <h2>Dispositivos Conectados</h2>
            <div className="devices-list">
              {devices.map((device) => (
                <div key={device.id} className="device-item">
                  <div className="device-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p>{device.lastActive} • {device.location}</p>
                  </div>
                  <button className="btn-revoke" onClick={() => handleRevokeDevice(device.id)}>
                    Revocar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="activity-section">
            <h2>Actividad Reciente</h2>
            <div className="activity-list">
              {activityLog.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-info">
                    <h4>{activity.action}</h4>
                    <p>{activity.date} • IP: {activity.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

