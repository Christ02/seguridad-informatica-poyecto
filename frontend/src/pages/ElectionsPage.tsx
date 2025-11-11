import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Users, Vote } from 'lucide-react';
import api from '@/services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ElectionsPage() {
  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const response = await api.get('/elections');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center"><div className="spinner mx-auto" /></div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Elecciones</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections?.map((election: any) => (
          <ElectionCard key={election.id} election={election} />
        ))}
      </div>
    </div>
  );
}

function ElectionCard({ election }: { election: any }) {
  const isActive = election.status === 'active';
  const isPending = election.status === 'setup';
  const isEnded = election.status === 'ended';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold">{election.title}</h3>
        <span className={`badge ${
          isActive ? 'badge-success' : 
          isPending ? 'badge-warning' : 
          'badge-info'
        }`}>
          {isActive ? 'Activa' : isPending ? 'Próximamente' : 'Finalizada'}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{election.description}</p>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {format(new Date(election.startDate), 'PPP', { locale: es })}
          </span>
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span>Participación: 0%</span>
        </div>
      </div>

      {isActive && (
        <Link
          to={`/vote/${election.id}`}
          className="btn btn-primary w-full mt-4 flex items-center justify-center"
        >
          <Vote className="w-4 h-4 mr-2" />
          Votar Ahora
        </Link>
      )}

      {isEnded && (
        <Link
          to={`/elections/${election.id}/results`}
          className="btn btn-secondary w-full mt-4"
        >
          Ver Resultados
        </Link>
      )}
    </div>
  );
}

