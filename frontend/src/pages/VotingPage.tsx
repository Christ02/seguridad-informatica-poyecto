/**
 * VotingPage Component
 * Página principal de votación con cifrado y verificación
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@components/Sidebar';
import { encryptVote, generateKeyPair, hashData } from '@utils/crypto';
import { sanitizeText } from '@utils/sanitize';
import './VotingPage.css';

interface Candidate {
  id: string;
  name: string;
  description: string;
  party: string;
  imageUrl?: string;
}

export function VotingPage() {
  const navigate = useNavigate();
  const { electionId } = useParams();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<string | null>(null);

  const election = {
    id: electionId || '1',
    title: 'Elección Presidencial 2025',
    description: 'Elección de presidente para el período 2025-2029',
    endDate: '30 de Noviembre, 2025',
    remainingTime: '3 días, 14 horas',
  };

  const candidates: Candidate[] = [
    {
      id: '1',
      name: 'María González',
      description: 'Propuestas enfocadas en educación, salud pública y desarrollo sostenible.',
      party: 'Partido Progresista',
      imageUrl: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=2563eb&color=fff&size=128',
    },
    {
      id: '2',
      name: 'Juan Martínez',
      description: 'Enfoque en economía, empleo y seguridad ciudadana.',
      party: 'Alianza Nacional',
      imageUrl: 'https://ui-avatars.com/api/?name=Juan+Martinez&background=10b981&color=fff&size=128',
    },
    {
      id: '3',
      name: 'Ana Rodríguez',
      description: 'Políticas de inclusión social, derechos humanos y transparencia.',
      party: 'Movimiento Social',
      imageUrl: 'https://ui-avatars.com/api/?name=Ana+Rodriguez&background=f59e0b&color=fff&size=128',
    },
  ];

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleConfirmVote = () => {
    if (!selectedCandidate) return;
    setShowConfirmation(true);
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) return;

    setIsProcessing(true);

    try {
      // Simular proceso de cifrado y envío
      // En producción, esto se conectaría al backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar claves para cifrado
      const keyPair = await generateKeyPair();
      
      // Cifrar el voto
      const voteData = JSON.stringify({
        electionId: election.id,
        candidateId: selectedCandidate,
        timestamp: Date.now(),
      });

      const encryptedVote = await encryptVote(voteData, keyPair.publicKey);
      
      // Generar hash del voto como recibo
      const receipt = await hashData(encryptedVote);
      
      setVoteReceipt(receipt);
      
      // Aquí iría el envío al backend
      console.log('Vote encrypted and ready to send:', {
        encryptedVote,
        receipt,
      });

    } catch (error) {
      console.error('Error al procesar voto:', error);
      alert('Hubo un error al procesar tu voto. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!voteReceipt) return;

    const receiptData = {
      election: election.title,
      voteHash: voteReceipt,
      timestamp: new Date().toISOString(),
      verificationUrl: `${window.location.origin}/verify/${voteReceipt}`,
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voto-recibo-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  if (voteReceipt) {
    return (
      <div className="voting-page-container">
        <Sidebar />
        
        <div className="voting-page-wrapper">
          <main className="voting-main">
            <div className="success-container">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h1>¡Voto Emitido Exitosamente!</h1>
              <p className="success-message">
                Tu voto ha sido registrado de forma segura y anónima. Gracias por participar en el proceso democrático.
              </p>

              <div className="receipt-card">
                <h3>Recibo Criptográfico</h3>
                <p className="receipt-info">
                  Guarda este código para verificar que tu voto fue contabilizado:
                </p>
                <div className="receipt-hash">
                  <code>{voteReceipt}</code>
                  <button 
                    className="btn-copy"
                    onClick={() => navigator.clipboard.writeText(voteReceipt)}
                    title="Copiar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>

                <div className="security-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Tu voto está cifrado con RSA-4096 y es completamente anónimo</span>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn-download" onClick={handleDownloadReceipt}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar Recibo
                </button>
                <button className="btn-finish" onClick={handleFinish}>
                  Volver al Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (showConfirmation && selectedCandidateData) {
    return (
      <div className="voting-page-container">
        <Sidebar />
        
        <div className="voting-page-wrapper">
          <main className="voting-main">
            <div className="confirmation-container">
              <h1>Confirma tu Voto</h1>
              <p className="warning-message">
                ⚠️ Una vez confirmado, tu voto no podrá ser modificado. Verifica que tu selección es correcta.
              </p>

              <div className="selected-candidate-card">
                <img src={selectedCandidateData.imageUrl} alt={selectedCandidateData.name} />
                <div className="candidate-details">
                  <h2>{selectedCandidateData.name}</h2>
                  <span className="party-badge">{selectedCandidateData.party}</span>
                  <p>{selectedCandidateData.description}</p>
                </div>
              </div>

              <div className="security-guarantees">
                <h3>Garantías de Seguridad</h3>
                <ul>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Tu voto será cifrado con RSA-4096
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Tu identidad permanecerá anónima
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Recibirás un comprobante criptográfico
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Podrás verificar que tu voto fue contado
                  </li>
                </ul>
              </div>

              <div className="confirmation-actions">
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowConfirmation(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-confirm-vote" 
                  onClick={handleSubmitVote}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Procesando Voto...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Confirmar y Emitir Voto
                    </>
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-page-container">
      <Sidebar />
      
      <div className="voting-page-wrapper">
        {/* Header */}
        <header className="voting-header">
          <div className="election-info">
            <h1>{election.title}</h1>
            <p>{election.description}</p>
          </div>
          <div className="election-timer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <span className="timer-label">Termina en:</span>
              <span className="timer-value">{election.remainingTime}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="voting-main">
          <div className="voting-instructions">
            <h2>Selecciona tu Candidato</h2>
            <p>Revisa las propuestas de cada candidato y selecciona tu opción preferida.</p>
          </div>

          <div className="candidates-grid">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                onClick={() => handleSelectCandidate(candidate.id)}
              >
                {selectedCandidate === candidate.id && (
                  <div className="selected-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                <img src={candidate.imageUrl} alt={candidate.name} className="candidate-photo" />
                
                <div className="candidate-content">
                  <h3>{candidate.name}</h3>
                  <span className="candidate-party">{candidate.party}</span>
                  <p className="candidate-description">{candidate.description}</p>
                </div>

                <button
                  className={`btn-select ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCandidate(candidate.id);
                  }}
                >
                  {selectedCandidate === candidate.id ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            ))}
          </div>

          <div className="voting-actions">
            <button className="btn-back" onClick={() => navigate('/dashboard')}>
              Cancelar
            </button>
            <button
              className="btn-continue"
              onClick={handleConfirmVote}
              disabled={!selectedCandidate}
            >
              Continuar
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

