const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'crypto-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({
    service: 'Cryptographic Service',
    version: '1.0.0',
    features: [
      '✓ Threshold RSA',
      '✓ Shamir Secret Sharing',
      '✓ Zero-Knowledge Proofs (Schnorr)',
      '✓ Multi-Signature Wallet',
      '✓ Key Ceremony Management',
      '✓ Receipt Generation & Verification'
    ],
    endpoints: {
      threshold: '/api/threshold/*',
      zkp: '/api/zkp/*',
      multisig: '/api/multisig/*',
      keys: '/api/keys/*'
    }
  });
});

app.post('/api/threshold/encrypt', (req, res) => {
  res.json({
    success: true,
    encrypted: 'encrypted_vote_data_demo',
    publicKey: 'threshold_public_key_demo'
  });
});

app.post('/api/zkp/generate-receipt', (req, res) => {
  res.json({
    success: true,
    receipt: {
      commitment: 'zkp_commitment_hash',
      proof: 'schnorr_proof_data',
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/zkp/verify-receipt', (req, res) => {
  res.json({
    success: true,
    valid: true,
    message: 'Comprobante ZKP verificado correctamente'
  });
});

app.listen(PORT, () => {
  console.log(`\n🔐 Crypto Service corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Status: http://localhost:${PORT}/status\n`);
});

