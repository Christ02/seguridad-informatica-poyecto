import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Vote, Users, Shield, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <aside className="md:col-span-1">
        <nav className="card space-y-2">
          <NavLink to="/admin" icon={<LayoutDashboard />} text="Dashboard" />
          <NavLink to="/admin/elections" icon={<Vote />} text="Elecciones" />
          <NavLink to="/admin/users" icon={<Users />} text="Usuarios" />
          <NavLink to="/admin/security" icon={<Shield />} text="Seguridad" />
          <NavLink to="/admin/settings" icon={<Settings />} text="Configuración" />
        </nav>
      </aside>

      <main className="md:col-span-3">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="elections" element={<div className="card">Gestión de Elecciones</div>} />
          <Route path="users" element={<div className="card">Gestión de Usuarios</div>} />
          <Route path="security" element={<div className="card">Eventos de Seguridad</div>} />
          <Route path="settings" element={<div className="card">Configuración del Sistema</div>} />
        </Routes>
      </main>
    </div>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard Administrativo</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Elecciones Activas" value="3" change="+2" />
        <StatCard title="Votos Totales" value="1,234" change="+156" />
        <StatCard title="Usuarios Registrados" value="5,678" change="+89" />
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4">Actividad Reciente</h3>
        <p className="text-gray-600">No hay eventos recientes</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-green-600">{change}</p>
    </div>
  );
}

