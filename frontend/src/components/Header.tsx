import { Link } from 'react-router-dom';
import { Shield, LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Sistema de Votación Seguro
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/elections" className="text-gray-700 hover:text-primary-600">
              Elecciones
            </Link>
            <Link to="/verify" className="text-gray-700 hover:text-primary-600">
              Verificar
            </Link>
            <Link to="/blockchain" className="text-gray-700 hover:text-primary-600">
              Blockchain
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600">
                    <Settings className="w-5 h-5" />
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

