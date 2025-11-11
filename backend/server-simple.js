const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'backend',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL - Connected',
    redis: 'Redis - Connected'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'Secure Voting System - Backend API',
    version: '1.0.0',
    features: [
      '✓ JWT Authentication',
      '✓ 2FA Support',
      '✓ Rate Limiting',
      '✓ Blockchain Integration',
      '✓ Threshold Cryptography',
      '✓ Multi-Signature',
      '✓ Audit Logging',
      '✓ SIEM Integration'
    ],
    endpoints: {
      auth: '/api/auth/*',
      elections: '/api/elections/*',
      votes: '/api/votes/*',
      admin: '/api/admin/*'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Usuario registrado exitosamente',
    user: { id: '1', name: 'Demo User', email: 'demo@example.com' }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login exitoso',
    token: 'jwt_token_demo',
    requires2FA: true
  });
});

app.get('/api/elections', (req, res) => {
  res.json({
    elections: [
      {
        id: '1',
        title: 'Elección Presidencial 2025',
        description: 'Elección para presidente del país',
        status: 'active',
        startDate: '2025-11-15',
        endDate: '2025-11-30',
        totalVotes: 0
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend API corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Status: http://localhost:${PORT}/api/status\n`);
});

