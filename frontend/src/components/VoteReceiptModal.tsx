/**
 * VoteReceiptModal Component
 * Modal para mostrar el recibo de votación con detalles criptográficos
 */

import { useEffect } from 'react';
import type { VoteHistory } from '@services/votes.api';
import './VoteReceiptModal.css';

interface VoteReceiptModalProps {
  vote: VoteHistory;
  onClose: () => void;
}

export function VoteReceiptModal({ vote, onClose }: VoteReceiptModalProps) {
  useEffect(() => {
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusInfo = (status: VoteHistory['status']) => {
    const statusMap = {
      contabilizado: {
        icon: '✓',
        text: 'Voto Contabilizado',
        color: '#10b981',
        bgColor: '#d1fae5',
      },
      emitido: {
        icon: '⏳',
        text: 'Voto Emitido',
        color: '#f59e0b',
        bgColor: '#fef3c7',
      },
      anulado: {
        icon: '✕',
        text: 'Voto Anulado',
        color: '#ef4444',
        bgColor: '#fee2e2',
      },
    };
    return statusMap[status];
  };

  const statusInfo = getStatusInfo(vote.status);

  return (
    <div className="receipt-modal-overlay" onClick={handleBackdropClick}>
      <div className="receipt-modal">
        {/* Header */}
        <div className="receipt-header">
          <div className="receipt-logo">
            <svg width="40" height="40" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#grad1)" />
              <rect x="30" y="45" width="40" height="35" rx="2" fill="white" opacity="0.95" />
              <path d="M 28 45 L 35 30 L 65 30 L 72 45 Z" fill="white" opacity="0.95" />
              <rect x="45" y="35" width="10" height="3" rx="1" fill="#667eea" />
              <rect x="43" y="25" width="14" height="12" rx="1" fill="#fbbf24" opacity="0.9" />
              <polyline
                points="47,30 49,32 53,28"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="receipt-title">
            <h2>Recibo de Votación</h2>
            <p>Comprobante Criptográfico</p>
          </div>
          <button className="receipt-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Status Badge */}
        <div className="receipt-status" style={{ backgroundColor: statusInfo.bgColor }}>
          <span className="status-icon" style={{ color: statusInfo.color }}>
            {statusInfo.icon}
          </span>
          <span style={{ color: statusInfo.color, fontWeight: 600 }}>
            {statusInfo.text}
          </span>
        </div>

        {/* Content */}
        <div className="receipt-content">
          {/* Election Info */}
          <div className="receipt-section">
            <h3>Información de la Elección</h3>
            <div className="receipt-field">
              <label>Elección:</label>
              <span>{vote.electionTitle}</span>
            </div>
            <div className="receipt-field">
              <label>Fecha de Votación:</label>
              <span>{formatDate(vote.votedAt)}</span>
            </div>
          </div>

          {/* Cryptographic Info */}
          <div className="receipt-section">
            <h3>Verificación Criptográfica</h3>
            <div className="receipt-field">
              <label>Hash del Voto:</label>
              <code className="receipt-hash">{vote.voteHash}</code>
            </div>
            <div className="receipt-field">
              <label>Código de Verificación:</label>
              <code className="receipt-code">{vote.verificationCode}</code>
            </div>
            {vote.signature && (
              <div className="receipt-field">
                <label>Firma Digital:</label>
                <code className="receipt-signature">{vote.signature.substring(0, 64)}...</code>
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="receipt-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong>Privacidad Garantizada</strong>
              <p>
                Este recibo confirma tu participación en la elección, pero NO revela tu selección.
                Tu voto es completamente anónimo y está protegido por encriptación end-to-end.
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="receipt-security">
            <div className="security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Voto Encriptado</span>
            </div>
            <div className="security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Verificación Blockchain</span>
            </div>
            <div className="security-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Anonimato Garantizado</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="receipt-footer">
          <p>
            <strong>VoteSecure</strong> - Sistema de Votación Electrónica Segura
          </p>
          <p className="receipt-timestamp">
            Recibo generado el {new Date().toLocaleDateString('es-GT', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

