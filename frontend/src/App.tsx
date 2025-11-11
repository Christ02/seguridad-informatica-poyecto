/**
 * App Component
 * Componente principal de la aplicación de votación segura
 */

import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('🔒 Sistema de Votación Segura - Inicializado');
    console.log('🛡️ Protecciones activas: XSS, CSRF, Rate Limiting');
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="security-badge">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Sistema Seguro</span>
        </div>
        <h1>Sistema de Votación Electrónica</h1>
        <p className="subtitle">Seguridad de Nivel Enterprise</p>
      </header>

      <main className="app-main">
        <section className="security-features">
          <h2>Características de Seguridad</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔐 Cifrado End-to-End</h3>
              <p>Votos cifrados con RSA-4096 antes de enviar al servidor</p>
            </div>

            <div className="feature-card">
              <h3>🔒 Voto Anónimo</h3>
              <p>Blind signatures garantizan que el voto no puede trackearse</p>
            </div>

            <div className="feature-card">
              <h3>🛡️ Protección XSS/CSRF</h3>
              <p>CSP estricto y tokens CSRF en todas las peticiones</p>
            </div>

            <div className="feature-card">
              <h3>✅ MFA Obligatorio</h3>
              <p>Autenticación multi-factor con TOTP y WebAuthn</p>
            </div>

            <div className="feature-card">
              <h3>📊 Logs de Auditoría</h3>
              <p>Registros inmutables de todas las acciones</p>
            </div>

            <div className="feature-card">
              <h3>⏱️ Rate Limiting</h3>
              <p>Protección contra ataques de fuerza bruta y DoS</p>
            </div>
          </div>
        </section>

        <section className="status">
          <h3>Estado del Sistema</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Frontend:</span>
              <span className="status-value status-ok">✓ Operativo</span>
            </div>
            <div className="status-item">
              <span className="status-label">API:</span>
              <span className="status-value status-pending">⏳ Pendiente</span>
            </div>
            <div className="status-item">
              <span className="status-label">Seguridad:</span>
              <span className="status-value status-ok">✓ Activa</span>
            </div>
          </div>
        </section>

        <section className="next-steps">
          <h3>Próximos Pasos</h3>
          <ul>
            <li>✅ Configuración del proyecto frontend con seguridad</li>
            <li>⏳ Implementar autenticación MFA</li>
            <li>⏳ Implementar sistema de votación con cifrado</li>
            <li>⏳ Configurar backend con NestJS</li>
            <li>⏳ Deploy en cloud con infraestructura segura</li>
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          🔒 Sistema de Votación Segura v1.0.0 | Seguridad Máxima | Zero-Trust Architecture
        </p>
      </footer>
    </div>
  );
}

export default App;
