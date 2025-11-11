/**
 * LoginForm Component
 * Formulario de login estilo Portal de Votación Ciudadana
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { validateEmail } from '@utils/validation';
import { sanitizeEmail, sanitizeText } from '@utils/sanitize';
import './LoginForm.css';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validaciones
    const newErrors: Record<string, string> = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (requiresMFA && mfaCode.length !== 6) {
      newErrors.mfaCode = 'El código debe tener 6 dígitos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Rate limiting client-side
    if (attempts >= 5) {
      setErrors({ general: 'Demasiados intentos. Espera 15 minutos.' });
      return;
    }

    // Sanitizar inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizeText(password);

    // Intentar login
    // TEMPORAL: Para demo, simular login exitoso
    if (sanitizedEmail && sanitizedPassword) {
      // Simular un usuario autenticado
      useAuthStore.getState().setUser({
        id: '1',
        email: sanitizedEmail,
        role: 'voter' as any,
        isVerified: true,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
      });
      
      // Navegar al dashboard
      navigate('/dashboard');
      return;
    }

    /* 
    // Código real de login (descomentar cuando el backend esté listo):
    const result = await login({
      email: sanitizedEmail,
      password: sanitizedPassword,
      mfaCode: requiresMFA ? mfaCode : undefined,
    });

    if (result.requiresMFA) {
      setRequiresMFA(true);
    } else if (result.success) {
      navigate('/dashboard');
    } else {
      setAttempts(attempts + 1);
      setErrors({ general: error || 'Login fallido' });
    }
    */
  };

  return (
    <div className="login-form-container">
      <header className="portal-header">
        <div className="portal-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb">
            <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
          </svg>
          <h1>Portal de Votación Ciudadana</h1>
        </div>
      </header>

      <div className="login-form-card">
        <div className="card-header">
          <h2>Sistema Electoral Digital</h2>
          <p className="card-subtitle">Inicia sesión o crea tu cuenta para participar</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Registrarse
          </button>
        </div>

        {!requiresMFA ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Número de Identificación</label>
              <div className="input-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="7" y2="8" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="16" x2="13" y2="16" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu número de identificación"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="forgot-password">
              <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>

            {errors.general && (
              <div className="error-banner">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.general}
              </div>
            )}

            <button type="submit" className="btn-primary btn-large" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="mfa-notice">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p>Ingresa tu código de autenticación de dos factores</p>
            </div>

            <div className="form-group">
              <label htmlFor="mfaCode">Código MFA (6 dígitos)</label>
              <input
                id="mfaCode"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
                autoComplete="one-time-code"
                disabled={isLoading}
                className="mfa-input"
              />
              {errors.mfaCode && <span className="error-message">{errors.mfaCode}</span>}
            </div>

            {errors.general && (
              <div className="error-banner">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.general}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setRequiresMFA(false)}
              disabled={isLoading}
            >
              Volver
            </button>
          </form>
        )}

        <footer className="card-footer">
          <a href="/privacy">Política de Privacidad</a>
          <span className="separator">•</span>
          <a href="/terms">Términos de Uso</a>
          <span className="separator">•</span>
          <a href="/support">Soporte</a>
        </footer>
      </div>
    </div>
  );
}

