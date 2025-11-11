import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Setup2FAPage from '@/pages/auth/Setup2FAPage';
import ElectionsPage from '@/pages/ElectionsPage';
import VotingPage from '@/pages/VotingPage';
import VerificationPage from '@/pages/VerificationPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import BlockchainExplorerPage from '@/pages/BlockchainExplorerPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="setup-2fa" element={<Setup2FAPage />} />
        
        {/* Public routes */}
        <Route path="elections" element={<ElectionsPage />} />
        <Route path="verify" element={<VerificationPage />} />
        <Route path="blockchain" element={<BlockchainExplorerPage />} />
        
        {/* Protected routes */}
        <Route
          path="vote/:electionId"
          element={
            isAuthenticated ? <VotingPage /> : <Navigate to="/login" replace />
          }
        />
        
        {/* Admin routes */}
        <Route
          path="admin/*"
          element={
            isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" replace />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;

