/**
 * App Component
 * Componente principal con routing y protección de rutas por roles
 * Última actualización: verificación de auto-deploy Vercel
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { Dashboard } from './pages/Dashboard';
import { VotingHistory } from './pages/VotingHistory';
import { VotingPage } from './pages/VotingPage';
import { ResultsPage } from './pages/ResultsPage';
import { ResultsListPage } from './pages/ResultsListPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateElection } from './pages/admin/CreateElection';
import { ManageCandidates } from './pages/admin/ManageCandidates';
import { ManageVoters } from './pages/admin/ManageVoters';
import { ElectionResults } from './pages/admin/ElectionResults';
import { AdminVotesHistory } from './pages/admin/AdminVotesHistory';
import { useAuthStore } from './features/auth/store/authStore';
import { useToast } from '@hooks/useToast';
import { Toast } from './components/Toast';
import { UserRole } from './types';
import { logger } from '@utils/logger';
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
  const { toasts, removeToast } = useToast();
  
  useEffect(() => {
    logger.success('Sistema de Votación Segura - Inicializado');
    logger.info('Protecciones activas: XSS, CSRF, Rate Limiting, MFA, RBAC');
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        {/* Toast Container */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              {...(toast.duration !== undefined && { duration: toast.duration })}
              onClose={removeToast}
            />
          ))}
        </div>
        
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

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
            path="/vote/:electionId"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <VotingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/results"
            element={
              <PrivateRoute allowedRoles={[UserRole.VOTER]}>
                <ResultsListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:electionId"
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
            path="/admin/create-election"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                <CreateElection />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/candidates"
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
            path="/admin/votes-history"
            element={
              <PrivateRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR]}>
                <AdminVotesHistory />
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
