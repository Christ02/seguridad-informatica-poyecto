/**
 * PDF Generator Utility
 * Genera PDFs del historial de votación
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { VoteHistory } from '@services/votes.api';

export const generateVotingHistoryPDF = (votes: VoteHistory[], userInfo?: { name: string; email: string }) => {
  // Crear documento PDF
  const doc = new jsPDF();
  
  // Configuración de colores
  const primaryColor: [number, number, number] = [102, 126, 234]; // #667eea
  const secondaryColor: [number, number, number] = [100, 116, 139]; // #64748b
  
  // Header con logo y título
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VoteSecure', 20, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Historial de Votación', 20, 30);
  
  // Fecha de generación
  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado: ${currentDate}`, 20, 36);
  
  // Información del usuario (si está disponible)
  let startY = 50;
  if (userInfo) {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Votante:', 20, startY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${userInfo.name}`, 20, startY + 7);
    doc.text(`Email: ${userInfo.email}`, 20, startY + 14);
    
    startY += 25;
  }
  
  // Nota de privacidad
  doc.setFillColor(239, 246, 255); // #eff6ff
  doc.rect(15, startY, 180, 20, 'F');
  
  doc.setTextColor(30, 64, 175); // #1e40af
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('🔒 Privacidad y Confidencialidad', 20, startY + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const privacyText = 'Este documento confirma su participación en las elecciones, pero NO revela su selección. Su voto es completamente anónimo.';
  const splitText = doc.splitTextToSize(privacyText, 170);
  doc.text(splitText, 20, startY + 13);
  
  startY += 28;
  
  // Tabla de votos
  const tableData = votes.map((vote) => {
    const date = new Date(vote.votedAt);
    const formattedDate = date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const statusMap: Record<VoteHistory['status'], string> = {
      contabilizado: 'Contabilizado',
      emitido: 'Emitido',
      anulado: 'Anulado',
    };
    
    return [
      vote.electionTitle,
      formattedDate,
      statusMap[vote.status],
      vote.verificationCode,
    ];
  });
  
  autoTable(doc, {
    startY: startY,
    head: [['Elección', 'Fecha', 'Estado', 'Código de Verificación']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42], // #0f172a
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // #f8fafc
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 45, fontStyle: 'bold', font: 'courier' },
    },
    margin: { left: 15, right: 15 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea separadora
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 280, 195, 280);
    
    // Texto del footer
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'VoteSecure - Sistema de Votación Electrónica Segura',
      105,
      285,
      { align: 'center' }
    );
    doc.text(
      'Todos los votos están protegidos por encriptación end-to-end',
      105,
      290,
      { align: 'center' }
    );
    
    // Número de página
    doc.text(
      `Página ${i} de ${pageCount}`,
      195,
      290,
      { align: 'right' }
    );
  }
  
  // Guardar PDF
  const fileName = `historial-votacion-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

export const generateVoteReceiptPDF = (vote: VoteHistory) => {
  const doc = new jsPDF();
  
  const primaryColor: [number, number, number] = [102, 126, 234];
  const secondaryColor: [number, number, number] = [100, 116, 139];
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Recibo de Votación', 105, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante Criptográfico', 105, 35, { align: 'center' });
  
  // Status badge
  let startY = 65;
  const statusMap = {
    contabilizado: { text: 'Voto Contabilizado', color: [16, 185, 129] as [number, number, number] },
    emitido: { text: 'Voto Emitido', color: [245, 158, 11] as [number, number, number] },
    anulado: { text: 'Voto Anulado', color: [239, 68, 68] as [number, number, number] },
  };
  
  const status = statusMap[vote.status];
  doc.setFillColor(...status.color);
  doc.roundedRect(55, startY, 100, 15, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(status.text, 105, startY + 10, { align: 'center' });
  
  startY += 30;
  
  // Información de la elección
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Información de la Elección', 20, startY);
  
  startY += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Elección:', 20, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(vote.electionTitle, 50, startY);
  
  startY += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha de Votación:', 20, startY);
  doc.setFont('helvetica', 'normal');
  const date = new Date(vote.votedAt).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  doc.text(date, 65, startY);
  
  startY += 20;
  
  // Verificación criptográfica
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Verificación Criptográfica', 20, startY);
  
  startY += 10;
  doc.setFontSize(9);
  
  // Hash del voto
  doc.setFont('helvetica', 'bold');
  doc.text('Hash del Voto:', 20, startY);
  startY += 6;
  doc.setFont('courier', 'normal');
  doc.setFillColor(248, 250, 252);
  doc.rect(20, startY - 4, 170, 10, 'F');
  const hashLines = doc.splitTextToSize(vote.voteHash, 165);
  doc.text(hashLines, 22, startY);
  startY += hashLines.length * 5 + 8;
  
  // Código de verificación
  doc.setFont('helvetica', 'bold');
  doc.text('Código de Verificación:', 20, startY);
  startY += 8;
  doc.setFillColor(254, 243, 199);
  doc.rect(60, startY - 6, 90, 12, 'F');
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(146, 64, 14);
  doc.text(vote.verificationCode, 105, startY, { align: 'center' });
  doc.setTextColor(...secondaryColor);
  startY += 20;
  
  // Firma digital (si existe)
  if (vote.signature) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Firma Digital:', 20, startY);
    startY += 6;
    doc.setFont('courier', 'normal');
    doc.setFillColor(248, 250, 252);
    doc.rect(20, startY - 4, 170, 10, 'F');
    const sigLines = doc.splitTextToSize(vote.signature.substring(0, 100) + '...', 165);
    doc.text(sigLines, 22, startY);
    startY += sigLines.length * 5 + 8;
  }
  
  // Nota de privacidad
  startY += 5;
  doc.setFillColor(239, 246, 255);
  doc.rect(15, startY, 180, 30, 'F');
  
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('🔒 Privacidad Garantizada', 20, startY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const privacyText = 'Este recibo confirma tu participación en la elección, pero NO revela tu selección. Tu voto es completamente anónimo y está protegido por encriptación end-to-end.';
  const splitText = doc.splitTextToSize(privacyText, 170);
  doc.text(splitText, 20, startY + 15);
  
  // Footer
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 270, 195, 270);
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VoteSecure', 105, 278, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sistema de Votación Electrónica Segura', 105, 284, { align: 'center' });
  
  const currentDate = new Date().toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Recibo generado el ${currentDate}`, 105, 290, { align: 'center' });
  
  // Guardar PDF
  const fileName = `recibo-votacion-${vote.verificationCode}.pdf`;
  doc.save(fileName);
};

