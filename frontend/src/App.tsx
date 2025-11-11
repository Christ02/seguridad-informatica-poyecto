/**
 * App Component
 * Componente principal con routing y protección de rutas por roles
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { VotingHistory } from './pages/VotingHistory';
import { VotingPage } from './pages/VotingPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateElection } from './pages/admin/CreateElection';
import { ManageCandidates } from './pages/admin/ManageCandidates';
import { ManageVoters } from './pages/admin/ManageVoters';
import { ElectionResults } from './pages/admin/ElectionResults';
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
                <VotingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/votar/:electionId"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <VotingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <ResultsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ayuda"
            element={
              <PrivateRoute>
                <HelpPage />
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
            path="/admin/elections/create"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <CreateElection />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/elections/:id/candidates"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <ManageCandidates />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/voters"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <ManageVoters />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <ElectionResults />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/elections"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <CreateElection />
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
