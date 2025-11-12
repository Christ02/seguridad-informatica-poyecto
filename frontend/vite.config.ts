import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Security: Define variables de entorno permitidas
  envPrefix: 'VITE_',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Security headers en desarrollo
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
    // CORS configuration
    cors: {
      origin: process.env.VITE_API_URL || 'http://localhost:4000',
      credentials: true,
    },
  },

  build: {
    // Security: Sourcemaps solo en desarrollo
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimizaciones de build
    minify: 'esbuild',
    
    // Chunk splitting para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['zustand', '@tanstack/react-query'],
        },
      },
    },
    
    // Security: No incluir node_modules en el bundle
    target: 'esnext',
    assetsInlineLimit: 4096, // 4kb
  },
  
  // Esbuild options para optimización
  esbuild: {
    // En producción, eliminar console.log y debugger pero mantener console.error y console.warn
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.debug'] : [],
  },

  // Preview server (production preview)
  preview: {
    port: 3000,
    strictPort: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
});
