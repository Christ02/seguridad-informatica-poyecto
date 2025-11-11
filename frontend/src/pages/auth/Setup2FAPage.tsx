import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode.react';
import api from '@/services/api';

export default function Setup2FAPage() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setup2FA = async () => {
      try {
        const response = await api.post('/auth/setup-2fa');
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      } catch (err: any) {
        setError('Error al generar código 2FA');
      }
    };

    setup2FA();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-2fa-setup', { totpCode: verifyCode });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Configurar 2FA</h1>
          <p className="text-gray-600 mt-2">
            Añade una capa extra de seguridad a tu cuenta
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              1. Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="flex justify-center">
                <QRCode value={qrCode} size={200} />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">
              O ingresa este código manualmente:
            </p>
            <code className="block bg-gray-100 p-3 rounded text-center font-mono">
              {secret}
            </code>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                2. Ingresa el código de 6 dígitos de tu aplicación
              </label>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Verificando...' : 'Verificar y Activar 2FA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

