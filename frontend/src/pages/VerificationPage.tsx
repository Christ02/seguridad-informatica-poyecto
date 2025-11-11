import { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/api';

export default function VerificationPage() {
  const [receipt, setReceipt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await api.post('/vote/verify-receipt', {
        receipt: JSON.parse(receipt),
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al verificar comprobante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Verificar Comprobante</h1>

      <div className="card">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ingresa tu comprobante de voto
            </label>
            <textarea
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              className="input min-h-[150px] font-mono text-sm"
              placeholder='{"voteHash": "...", "proof": {...}}'
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center"
          >
            <Search className="w-5 h-5 mr-2" />
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-start">
            <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`mt-6 p-4 rounded-lg flex items-start ${
            result.valid
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.valid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${
                result.valid ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.valid ? '✓ Comprobante Válido' : '✗ Comprobante Inválido'}
              </p>
              {result.valid && (
                <div className="text-sm mt-2 space-y-1">
                  <p><strong>Elección:</strong> {result.electionId}</p>
                  <p><strong>Hash del Bloque:</strong> {result.blockHash}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 card bg-blue-50">
        <h3 className="font-bold mb-2">¿Cómo funciona la verificación?</h3>
        <p className="text-sm text-gray-700">
          Tu comprobante contiene una prueba de conocimiento cero que permite verificar
          que tu voto fue registrado correctamente sin revelar por quién votaste. El sistema
          verifica la firma criptográfica y la presencia del voto en la blockchain.
        </p>
      </div>
    </div>
  );
}

