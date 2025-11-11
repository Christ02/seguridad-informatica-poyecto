import { useQuery } from '@tanstack/react-query';
import { Box, Hash, Clock } from 'lucide-react';
import api from '@/services/api';
import { format } from 'date-fns';

export default function BlockchainExplorerPage() {
  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const response = await api.get('/elections');
      return response.data;
    },
  });

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Explorador de Blockchain</h1>

      <div className="card mb-8 bg-blue-50">
        <h3 className="font-bold mb-2">Transparencia Total</h3>
        <p className="text-sm text-gray-700">
          Todos los votos son almacenados en una blockchain pública e inmutable. 
          Puedes verificar la integridad de cualquier elección sin comprometer la privacidad de los votantes.
        </p>
      </div>

      <div className="space-y-6">
        {elections?.map((election: any) => (
          <ElectionBlockchain key={election.id} election={election} />
        ))}
      </div>
    </div>
  );
}

function ElectionBlockchain({ election }: { election: any }) {
  const { data: blocks } = useQuery({
    queryKey: ['blockchain', election.id],
    queryFn: async () => {
      const response = await api.get(`/blockchain/${election.id}/blocks`);
      return response.data;
    },
  });

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">{election.title}</h2>

      <div className="space-y-3">
        {blocks?.map((block: any, index: number) => (
          <div key={block.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Box className="w-5 h-5 text-primary-600 mr-2" />
                <span className="font-bold">Bloque #{block.blockIndex}</span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(block.timestamp), 'PPpp')}
              </span>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center text-gray-600">
                <Hash className="w-4 h-4 mr-2" />
                <span className="font-mono truncate">{block.hash}</span>
              </div>
              {index > 0 && (
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-mono truncate">Prev: {block.previousHash}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

