/**
 * ProfilePage Component  
 * Página de perfil de usuario con configuración de seguridad - Conectado al backend
 */

import { useState, useEffect } from 'react';
import { Sidebar } from '@components/Sidebar';
import { useToast } from '@hooks/useToast';
import { usersApi } from '@services/users.api';
import type { UserProfile, UpdateProfileData, ChangePasswordData, UserActivity } from '@services/users.api';
import './ProfilePage.css';

export function ProfilePage() {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activityLog, setActivityLog] = useState<UserActivity[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { profile: fetchedProfile } = await usersApi.getProfile();
      setProfile(fetchedProfile);
      setFormData({
        email: fetchedProfile.email,
        phoneNumber: fetchedProfile.phoneNumber,
        address: fetchedProfile.address || '',
      });
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      showToast('error', error.response?.data?.message || 'Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const { activities } = await usersApi.getActivity();
      setActivityLog(activities);
    } catch (error) {
      console.error('Error al cargar actividad:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateProfileData = {};
      
      if (formData.email !== profile?.email) updateData.email = formData.email;
      if (formData.phoneNumber !== profile?.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.address !== profile?.address) updateData.address = formData.address;

      if (Object.keys(updateData).length === 0) {
        showToast('info', 'No hay cambios para guardar');
        setIsEditing(false);
        return;
      }

      const { profile: updatedProfile } = await usersApi.updateProfile(updateData);
      setProfile(updatedProfile);
      setFormData({
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
        address: updatedProfile.address || '',
      });
      showToast('success', 'Perfil actualizado exitosamente');
      setIsEditing(false);
      fetchActivity(); // Recargar actividad
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      showToast('error', error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('error', 'Todos los campos son requeridos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      showToast('error', 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales');
      return;
    }

    setIsSaving(true);
    try {
      const changeData: ChangePasswordData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };
      await usersApi.changePassword(changeData);
      showToast('success', 'Contraseña actualizada exitosamente');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      fetchActivity(); // Recargar actividad
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      showToast('error', error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page-container">
        <Sidebar />
        <div className="profile-page-wrapper">
          <main className="profile-main">
            <div className="loading-spinner"></div>
            <p>Cargando perfil...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page-container">
        <Sidebar />
        <div className="profile-page-wrapper">
          <main className="profile-main">
            <div className="error-container">
              <p>Error al cargar el perfil</p>
              <button className="btn-primary" onClick={fetchProfile}>
                Reintentar
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <Sidebar />

      <div className="profile-page-wrapper">
        <header className="profile-header">
          <h1>Mi Perfil</h1>
          <p>Gestiona tu información personal y configuración de seguridad</p>
        </header>

        <main className="profile-main">
          {/* Info Box */}
          <div className="page-info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <p>Tu información personal está protegida con cifrado de extremo a extremo</p>
          </div>
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
                <h2>{profile.fullName}</h2>
                <span className="profile-id">DPI: {profile.dpi}</span>
                <span className={`profile-badge ${profile.isVerified ? 'verified' : 'unverified'}`}>
                  {profile.isVerified ? 'Cuenta Verificada' : 'No Verificada'}
                </span>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-section">
                <h3>Información Personal</h3>
                <p className="info-note">Los campos DPI, nombres, apellidos, fecha de nacimiento, departamento y municipio no son editables.</p>
                
                <div className="form-grid">
                  {/* Campos NO editables */}
                  <div className="form-field">
                    <label>Nombres</label>
                    <input type="text" value={profile.firstName} disabled className="disabled-field" />
                  </div>
                  <div className="form-field">
                    <label>Apellidos</label>
                    <input type="text" value={profile.lastName} disabled className="disabled-field" />
                  </div>
                  <div className="form-field">
                    <label>DPI</label>
                    <input type="text" value={profile.dpi} disabled className="disabled-field" />
                  </div>
                  <div className="form-field">
                    <label>Fecha de Nacimiento</label>
                    <input 
                      type="text" 
                      value={new Date(profile.dateOfBirth).toLocaleDateString('es-GT')} 
                      disabled 
                      className="disabled-field" 
                    />
                  </div>
                  <div className="form-field">
                    <label>Departamento</label>
                    <input 
                      type="text" 
                      value={profile.department || 'No especificado'} 
                      disabled 
                      className="disabled-field" 
                    />
                  </div>
                  <div className="form-field">
                    <label>Municipio</label>
                    <input 
                      type="text" 
                      value={profile.municipality || 'No especificado'} 
                      disabled 
                      className="disabled-field" 
                    />
                  </div>

                  {/* Campos EDITABLES */}
                  <div className="form-field">
                    <label>Correo Electrónico *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-field">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                      maxLength={8}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="form-field full-width">
                    <label>Dirección *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      rows={2}
                      placeholder="Ingresa tu dirección completa"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                {isEditing ? (
                  <>
                    <button 
                      className="btn-cancel" 
                      onClick={() => { 
                        setIsEditing(false); 
                        setFormData({
                          email: profile.email,
                          phoneNumber: profile.phoneNumber,
                          address: profile.address || '',
                        });
                      }} 
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
                <button className="btn-security-action" onClick={() => setShowPasswordModal(true)}>
                  Cambiar
                </button>
              </div>

              <div className="security-card">
                <div className="security-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="security-card-content">
                  <h3>Autenticación de Dos Factores</h3>
                  <p>{profile.mfaEnabled ? 'MFA está activado' : 'Protege tu cuenta con un segundo factor'}</p>
                </div>
                <button className="btn-security-action" onClick={() => setShowMFASetup(!showMFASetup)}>
                  {profile.mfaEnabled ? 'Desactivar' : 'Activar'}
                </button>
              </div>

              <div className="security-card">
                <div className="security-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="security-card-content">
                  <h3>Última sesión</h3>
                  <p>
                    {profile.lastLoginAt
                      ? new Date(profile.lastLoginAt).toLocaleString('es-GT')
                      : 'No disponible'}
                  </p>
                </div>
                <button className="btn-security-action" onClick={fetchActivity}>
                  Ver Actividad
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="activity-section">
            <h2>Actividad Reciente</h2>
            <div className="activity-list">
              {activityLog.length === 0 ? (
                <div className="no-activity">
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                activityLog.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-info">
                      <h4>{activity.action}</h4>
                      <p>{new Date(activity.date).toLocaleString('es-GT')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => !isSaving && setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cambiar Contraseña</h3>
            <div className="form-group">
              <label>Contraseña Actual</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                disabled={isSaving}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                disabled={isSaving}
                placeholder="Mínimo 8 caracteres"
              />
              <small>Debe contener mayúsculas, minúsculas, números y caracteres especiales</small>
            </div>
            <div className="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                disabled={isSaving}
                placeholder="Repite tu nueva contraseña"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowPasswordModal(false)} disabled={isSaving}>
                Cancelar
              </button>
              <button className="btn-save" onClick={handlePasswordChange} disabled={isSaving}>
                {isSaving ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
