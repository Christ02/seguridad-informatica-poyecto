/**
 * LoginForm Component
 * Formulario de login estilo Portal de Votación Ciudadana
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '@utils/validation';
import { sanitizeEmail, sanitizeText } from '@utils/sanitize';
import { UserRole } from '@/types';
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

    // Intentar login REAL con backend
    try {
      const credentials: { identifier: string; password: string; mfaCode?: string } = {
        identifier: sanitizedEmail,
        password: sanitizedPassword,
      };
      
      if (requiresMFA && mfaCode) {
        credentials.mfaCode = mfaCode;
      }
      
      const result = await login(credentials);

      if (result.success && result.user) {
        // El useAuth hook ya guardó el usuario y los tokens en el authStore
        // Navegar al dashboard según el rol
        const isAdmin = result.user.role === UserRole.ADMIN || result.user.role === UserRole.SUPER_ADMIN;
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setAttempts(attempts + 1);
      setErrors({ 
        general: err?.response?.data?.message || error || 'Credenciales inválidas. Verifica tu ID y contraseña.' 
      });
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-wrapper">
        {/* Logo Superior */}
        <div className="portal-brand">
          <div className="portal-brand-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb">
              <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
            </svg>
            <h1>Portal de Votación Ciudadana</h1>
          </div>
        </div>

        <div className="login-form-card">
          {/* Título Principal dentro del card */}
          <div className="card-header">
            <h2>Sistema Electoral Digital</h2>
          </div>

        {!requiresMFA ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-input-wrapper">
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
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Recordarme y Olvidaste contraseña */}
            <div className="form-row">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recordarme</label>
              </div>
              <div className="forgot-password">
                <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
              </div>
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
            <div className="register-link">
              ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
            </div>
            <div className="footer-links">
              <a href="/privacy">Política de Privacidad</a>
              <span className="separator">•</span>
              <a href="/terms">Términos de Uso</a>
              <span className="separator">•</span>
              <a href="/support">Soporte</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

