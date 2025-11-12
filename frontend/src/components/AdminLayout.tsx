/**
 * AdminLayout Component
 * Layout reutilizable para todas las páginas de admin
 */

import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/authStore';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Top Navigation */}
      <nav className="admin-top-nav">
        <div className="nav-left">
          <div className="brand" onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#2563eb">
              <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
            </svg>
            <span>Plataforma de Votación</span>
          </div>
          <div className="nav-links">
            <a 
              href="/admin/dashboard" 
              className={isActive('/admin/dashboard') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}
            >
              Dashboard
            </a>
            <a 
              href="/admin/create-election" 
              className={isActive('/admin/create-election') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/admin/create-election'); }}
            >
              Elecciones
            </a>
            <a 
              href="/admin/candidates" 
              className={isActive('/admin/candidates') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/admin/candidates'); }}
            >
              Candidatos
            </a>
            <a 
              href="/admin/voters" 
              className={isActive('/admin/voters') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/admin/voters'); }}
            >
              Usuarios
            </a>
            <a 
              href="/admin/results" 
              className={isActive('/admin/results') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/admin/results'); }}
            >
              Resultados
            </a>
            <a 
              href="/admin/votes-history" 
              className={isActive('/admin/votes-history') ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/admin/votes-history'); }}
            >
              Historial
            </a>
          </div>
        </div>
        <div className="nav-right">
          <button className="btn-icon" title="Notificaciones">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <div className="user-menu" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Cerrar sesión">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span>{user?.email?.split('@')[0] || 'Admin'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Page Header */}
        <div className="admin-page-header">
          <div className="header-text">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="header-actions">{actions}</div>}
        </div>

        {/* Page Content */}
        <div className="admin-page-content">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="admin-footer">
        <p>© 2024 Entidad Gubernamental. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

