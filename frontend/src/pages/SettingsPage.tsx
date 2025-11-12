/**
 * SettingsPage Component
 * Página de configuración general de la aplicación
 */

import { useState } from 'react';
import { Sidebar } from '@components/Sidebar';
import './SettingsPage.css';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    electionReminders: true,
    resultsNotifications: true,
    darkMode: false,
    language: 'es',
    autoLogout: '30',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    console.log('Guardando configuración:', settings);
  };

  return (
    <div className="settings-page-container">
      <Sidebar />

      <div className="settings-page-wrapper">
        <header className="settings-header">
          <h1>Configuración</h1>
          <p>Personaliza tu experiencia en la plataforma</p>
        </header>

        <main className="settings-main">
          {/* Info Box */}
          <div className="page-info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p>Tus preferencias se guardan automáticamente y están sincronizadas en todos tus dispositivos</p>
          </div>
          {/* Notifications */}
          <div className="settings-section">
            <h2>Notificaciones</h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Notificaciones por Email</h3>
                  <p>Recibe actualizaciones importantes por correo electrónico</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Notificaciones por SMS</h3>
                  <p>Recibe alertas por mensaje de texto</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={() => handleToggle('smsNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Recordatorios de Elecciones</h3>
                  <p>Recibe recordatorios cuando se acerque una elección</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.electionReminders}
                    onChange={() => handleToggle('electionReminders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Notificaciones de Resultados</h3>
                  <p>Recibe notificaciones cuando se publiquen resultados</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.resultsNotifications}
                    onChange={() => handleToggle('resultsNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <h2>Apariencia</h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Modo Oscuro</h3>
                  <p>Cambia al tema oscuro para reducir el cansancio visual</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={() => handleToggle('darkMode')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Idioma</h3>
                  <p>Selecciona el idioma de la interfaz</p>
                </div>
                <select
                  className="setting-select"
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="settings-section">
            <h2>Seguridad y Privacidad</h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Cierre de Sesión Automático</h3>
                  <p>Tiempo de inactividad antes de cerrar sesión automáticamente</p>
                </div>
                <select
                  className="setting-select"
                  value={settings.autoLogout}
                  onChange={(e) => handleChange('autoLogout', e.target.value)}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                  <option value="never">Nunca</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="settings-section">
            <h2>Legal</h2>
            <div className="settings-list">
              <div className="link-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Términos y Condiciones</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="link-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Política de Privacidad</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>

              <div className="link-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Política de Seguridad</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="settings-actions">
            <button className="btn-save-settings" onClick={handleSave}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Guardar Cambios
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

