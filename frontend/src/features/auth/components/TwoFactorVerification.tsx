/**
 * TwoFactorVerification Component
 * Componente para ingresar y verificar código de 6 dígitos
 */

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@services/auth.api';
import { useAuthStore } from '@features/auth/store/authStore';
import { UserRole } from '@/types';
import './TwoFactorVerification.css';

interface TwoFactorVerificationProps {
  userId: string;
  email: string;
  onCancel?: () => void;
}

export function TwoFactorVerification({
  userId,
  email,
  onCancel,
}: TwoFactorVerificationProps) {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus primer input
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-avanzar al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Retroceder al input anterior
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) {
      newCode.push('');
    }
    setCode(newCode.slice(0, 6));
    setError('');

    // Focus en el último dígito
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await authApi.verify2FA(userId, fullCode);

      // Asegurar que el rol sea del tipo UserRole correcto
      const userWithCorrectRole = {
        ...response.user,
        role: response.user.role as UserRole,
      };

      // Guardar token y usuario
      setUser(userWithCorrectRole, response.accessToken, response.refreshToken);

      // Redirigir según el rol
      if (response.user.role === 'ADMIN' || response.user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('2FA verification error:', err);
      setError(err.response?.data?.message || 'Código inválido o expirado. Intenta nuevamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      setError('');
      
      // TODO: Implementar endpoint para reenviar código
      // await authApi.resend2FACode(userId);
      
      alert('Código reenviado. Por favor revisa tu correo electrónico.');
    } catch (err: any) {
      setError('Error al reenviar el código. Intenta nuevamente.');
    } finally {
      setResending(false);
    }
  };

  // Ocultar email parcialmente (ej: c***@gmail.com)
  const maskedEmail = email.replace(
    /^(.{1})(.*)(@.*)$/,
    (_, first, middle, domain) => first + '*'.repeat(middle.length) + domain
  );

  return (
    <div className="two-factor-container">
      <div className="two-factor-card">
        <div className="two-factor-header">
          <div className="icon-shield">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2>Verificación de Seguridad</h2>
          <p className="subtitle">
            Hemos enviado un código de 6 dígitos a <strong>{maskedEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="two-factor-form">
          <div className="code-inputs" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`code-input ${error ? 'error' : ''}`}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-verify"
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Verificando...
              </>
            ) : (
              'Verificar Código'
            )}
          </button>

          <div className="two-factor-footer">
            <button
              type="button"
              className="btn-resend"
              onClick={handleResendCode}
              disabled={resending}
            >
              {resending ? 'Reenviando...' : '¿No recibiste el código?'}
            </button>

            {onCancel && (
              <button
                type="button"
                className="btn-cancel"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="security-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Este código expira en 10 minutos</span>
        </div>
      </div>
    </div>
  );
}

