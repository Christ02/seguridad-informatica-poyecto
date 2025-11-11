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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    
    // Chunk splitting para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'crypto-vendor': ['crypto-js'],
          'ui-vendor': ['zustand', '@tanstack/react-query'],
        },
      },
    },
    
    // Security: No incluir node_modules en el bundle
    target: 'esnext',
    assetsInlineLimit: 4096, // 4kb
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

  // Testing configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
      all: true,
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
  },
});
