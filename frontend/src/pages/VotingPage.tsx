import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export default function VotingPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const { data: election } = useQuery({
    queryKey: ['election', electionId],
    queryFn: async () => {
      const response = await api.get(`/elections/${electionId}`);
      return response.data;
    },
  });

  const { data: candidates } = useQuery({
    queryKey: ['candidates', electionId],
    queryFn: async () => {
      const response = await api.get(`/elections/${electionId}/candidates`);
      return response.data;
    },
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      // In production, this would encrypt the vote client-side
      const response = await api.post('/vote/cast', {
        electionId,
        voteOptionId: selectedCandidate,
        encryptedVote: `encrypted_${selectedCandidate}`,
        signature: 'client_signature',
      });
      return response.data;
    },
    onSuccess: (data) => {
      setReceipt(data.receipt);
    },
  });

  if (receipt) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">¡Voto Registrado!</h1>
          <p className="text-gray-600 mb-6">
            Tu voto ha sido registrado de forma segura en la blockchain.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Tu Comprobante</h3>
            <code className="text-sm break-all">{JSON.stringify(receipt)}</code>
          </div>

          <button
            onClick={() => navigate('/verify')}
            className="btn btn-primary"
          >
            Verificar Mi Voto
          </button>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Confirmar Voto</h2>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">¡Atención!</p>
                <p className="text-sm text-yellow-700">
                  Una vez confirmado, tu voto no puede ser modificado.
                </p>
              </div>
            </div>
          </div>

          <p className="mb-4">Has seleccionado:</p>
          <div className="bg-primary-50 p-4 rounded-lg mb-6">
            <p className="font-bold text-lg">
              {candidates?.find((c: any) => c.id === selectedCandidate)?.name}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setConfirmed(false)}
              className="btn btn-secondary flex-1"
            >
              Volver
            </button>
            <button
              onClick={() => voteMutation.mutate()}
              disabled={voteMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {voteMutation.isPending ? 'Enviando...' : 'Confirmar Voto'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">{election?.title}</h1>
      <p className="text-gray-600 mb-8">{election?.description}</p>

      <div className="space-y-4">
        {candidates?.map((candidate: any) => (
          <div
            key={candidate.id}
            className={`card cursor-pointer transition-all ${
              selectedCandidate === candidate.id
                ? 'ring-2 ring-primary-600 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedCandidate(candidate.id)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={selectedCandidate === candidate.id}
                onChange={() => setSelectedCandidate(candidate.id)}
                className="mr-4"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{candidate.name}</h3>
                {candidate.party && (
                  <p className="text-gray-600">{candidate.party}</p>
                )}
                {candidate.description && (
                  <p className="text-sm text-gray-500 mt-2">
                    {candidate.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setConfirmed(true)}
        disabled={!selectedCandidate}
        className="btn btn-primary w-full mt-8"
      >
        Continuar
      </button>
    </div>
  );
}

