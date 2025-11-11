/**
 * App Component
 * Componente principal con routing
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { VotingHistory } from './pages/VotingHistory';
import { useAuthStore } from './features/auth/store/authStore';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  useEffect(() => {
    console.log('🔒 Sistema de Votación Segura - Inicializado');
    console.log('🛡️ Protecciones activas: XSS, CSRF, Rate Limiting, MFA');
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <PrivateRoute>
                <VotingHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/votar"
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}>Página de Votación - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados"
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}>Página de Resultados - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}>Página de Perfil - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}>Página de Configuración - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/ayuda"
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}>Página de Ayuda - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
