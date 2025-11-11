/**
 * App Component
 * Componente principal de la aplicación de votación segura
 */

import { useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm';
import './App.css';

function App() {
  useEffect(() => {
    console.log('🔒 Sistema de Votación Segura - Inicializado');
    console.log('🛡️ Protecciones activas: XSS, CSRF, Rate Limiting, MFA');
  }, []);

  return (
    <div className="app">
      <LoginForm />
    </div>
  );
}

export default App;
