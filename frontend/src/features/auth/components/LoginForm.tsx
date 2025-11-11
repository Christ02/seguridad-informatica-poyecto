/**
 * LoginForm Component
 * Formulario de login con soporte para MFA
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '@utils/validation';
import { sanitizeEmail, sanitizeText } from '@utils/sanitize';
import './LoginForm.css';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);

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
    const result = await login({
      email: sanitizedEmail,
      password: sanitizedPassword,
      mfaCode: requiresMFA ? mfaCode : undefined,
    });

    if (result.requiresMFA) {
      setRequiresMFA(true);
    } else if (!result.success) {
      setAttempts(attempts + 1);
      setErrors({ general: error || 'Login fallido' });
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <div className="security-badge-header">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h2>Inicio de Sesión Seguro</h2>
        </div>

        {!requiresMFA ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
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
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <div className="security-info">
              <small>
                🔒 Conexión cifrada con TLS 1.3 | Protección contra ataques de fuerza bruta
              </small>
            </div>
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

        <div className="login-footer">
          <p>
            Intentos: <strong>{attempts}/5</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

