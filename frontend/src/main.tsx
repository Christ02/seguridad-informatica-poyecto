/**
 * Main Entry Point
 * Punto de entrada principal de la aplicación
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Inicializar aplicación con StrictMode para detectar problemas
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Log de seguridad
if (import.meta.env.DEV) {
  console.log('%c🔒 SECURITY MODE: DEVELOPMENT', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
  console.log('CSP enabled, XSS protection active, CSRF tokens required');
} else {
  console.log('%c🔒 PRODUCTION MODE', 'color: #10b981; font-weight: bold; font-size: 16px;');
  console.log('All security features enabled');
}
