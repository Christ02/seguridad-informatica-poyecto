/**
 * App Component
 * Componente principal con routing y protección de rutas por roles
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VotingHistory } from './pages/VotingHistory';
import { useAuthStore } from './features/auth/store/authStore';
import { UserRole } from './types';
import './App.css';

// Protected Route component con verificación de roles
function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Si es admin intentando acceder a ruta de usuario, redirigir a admin dashboard
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Si es usuario intentando acceder a ruta de admin, redirigir a dashboard normal
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  useEffect(() => {
    console.log('🔒 Sistema de Votación Segura - Inicializado');
    console.log('🛡️ Protecciones activas: XSS, CSRF, Rate Limiting, MFA, RBAC');
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginForm />} />

          {/* Rutas de Usuario Normal */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <VotingHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/votar"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <div style={{ padding: '2rem' }}>Página de Votación - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <div style={{ padding: '2rem' }}>Página de Resultados - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
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

          {/* Rutas de Administrador */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/elections"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <div style={{ padding: '2rem' }}>Gestión de Elecciones - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/voters"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <div style={{ padding: '2rem' }}>Gestión de Votantes - Próximamente</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <div style={{ padding: '2rem' }}>Reportes - Próximamente</div>
              </PrivateRoute>
            }
          />

          {/* Ruta raíz - redirige según el rol */}
          <Route
            path="/"
            element={
              <RoleBasedRedirect />
            }
          />

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Componente para redireccionar según el rol del usuario
function RoleBasedRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol
  if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default App;
