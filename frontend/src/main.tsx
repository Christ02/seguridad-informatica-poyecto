import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Integrity check
const verifyIntegrity = () => {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.integrity && !script.integrity.startsWith('sha')) {
      console.error('Integrity check failed for script:', script.src);
      return false;
    }
  }
  return true;
};

// Check integrity before mounting
if (import.meta.env.PROD && !verifyIntegrity()) {
  console.error('Application integrity check failed');
  document.body.innerHTML = '<h1>Security Error: Application integrity check failed</h1>';
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

