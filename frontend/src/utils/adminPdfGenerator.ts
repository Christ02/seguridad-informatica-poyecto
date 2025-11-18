/**
 * Admin PDF Generator Utility
 * Genera PDFs para el panel de administración
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Candidate } from '@services/candidates.api';
import type { VoteHistoryItem } from '@services/admin.api';

const primaryColor: [number, number, number] = [102, 126, 234]; // #667eea
const secondaryColor: [number, number, number] = [100, 116, 139]; // #64748b

/**
 * Genera PDF de resultados de elección
 */
export const generateElectionResultsPDF = (
  electionTitle: string,
  electionDescription: string,
  startDate: string,
  endDate: string,
  candidates: Candidate[],
  totalVotes: number
) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('VoteSecure', 20, 20);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Resultados de Elección', 20, 30);

  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado: ${currentDate}`, 20, 38);

  // Información de la elección
  let startY = 55;
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Información de la Elección', 20, startY);

  startY += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Elección:', 20, startY);
  doc.setFont('helvetica', 'normal');
  const titleLines = doc.splitTextToSize(electionTitle, 160);
  doc.text(titleLines, 50, startY);
  startY += titleLines.length * 5 + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Descripción:', 20, startY);
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(electionDescription, 160);
  doc.text(descLines, 50, startY);
  startY += descLines.length * 5 + 5;

  // Fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  doc.setFont('helvetica', 'bold');
  doc.text('Período:', 20, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(startDate)} - ${formatDate(endDate)}`, 50, startY);
  startY += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Total de Votos:', 20, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(totalVotes.toLocaleString(), 50, startY);
  startY += 15;

  // Tabla de resultados
  const tableData = candidates.map((candidate, index) => {
    const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(2) : '0.00';
    const isWinner = index === 0 && totalVotes > 0;
    
    return [
      isWinner ? '🏆' : (index + 1).toString(),
      candidate.name,
      candidate.party || 'Independiente',
      candidate.voteCount.toLocaleString(),
      `${percentage}%`,
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [['#', 'Candidato', 'Partido', 'Votos', 'Porcentaje']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 45 },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (data) => {
      // Destacar al ganador
      if (data.row.index === 0 && data.section === 'body') {
        doc.setFillColor(254, 243, 199); // #fef3c7
      }
    },
  });

  // Nota de seguridad
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(239, 246, 255);
  doc.rect(15, finalY, 180, 25, 'F');

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('🔒 Seguridad y Transparencia', 20, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const securityText = 'Todos los votos están protegidos por encriptación end-to-end y verificación criptográfica. Este documento es un resumen oficial de los resultados.';
  const splitSecurity = doc.splitTextToSize(securityText, 170);
  doc.text(splitSecurity, 20, finalY + 15);

  // Footer
  addFooter(doc);

  // Guardar
  const fileName = `resultados-${electionTitle.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Genera PDF del historial de votos (Admin)
 */
export const generateVotesHistoryPDF = (votes: VoteHistoryItem[]) => {
  const doc = new jsPDF('landscape'); // Horizontal para más columnas

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 297, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('VoteSecure', 20, 20);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Historial de Votaciones', 20, 30);

  doc.setFontSize(10);
  const currentDate = new Date().toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generado: ${currentDate}`, 20, 38);

  // Estadísticas
  let startY = 55;
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de votos: ${votes.length.toLocaleString()}`, 20, startY);
  
  const validVotes = votes.filter(v => v.isValid).length;
  doc.text(`Votos válidos: ${validVotes.toLocaleString()}`, 100, startY);
  
  const invalidVotes = votes.length - validVotes;
  doc.text(`Votos inválidos: ${invalidVotes.toLocaleString()}`, 180, startY);

  startY += 15;

  // Tabla de votos
  const tableData = votes.map((vote) => {
    const date = new Date(vote.timestamp);
    const formattedDate = date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return [
      vote.electionTitle,
      vote.candidateName,
      vote.voterName,
      vote.voterEmail,
      vote.voteHash.substring(0, 16) + '...',
      vote.isValid ? 'Válido' : 'Inválido',
      formattedDate,
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [['Elección', 'Candidato', 'Votante', 'Email', 'Hash', 'Estado', 'Fecha']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 45 },
      4: { cellWidth: 40, font: 'courier', fontSize: 7 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 35 },
    },
    margin: { left: 15, right: 15 },
    didDrawCell: (data) => {
      // Destacar votos inválidos
      if (data.column.index === 5 && data.cell.text[0] === 'Inválido') {
        doc.setTextColor(239, 68, 68); // #ef4444
      }
    },
  });

  // Footer
  addFooter(doc);

  // Guardar
  const fileName = `historial-votos-${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Agrega footer a todas las páginas
 */
const addFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageHeight = doc.internal.pageSize.height;
    
    // Línea separadora
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 20, doc.internal.pageSize.width - 15, pageHeight - 20);
    
    // Texto del footer
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'VoteSecure - Sistema de Votación Electrónica Segura',
      doc.internal.pageSize.width / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    doc.text(
      'Documento confidencial - Solo para uso autorizado',
      doc.internal.pageSize.width / 2,
      pageHeight - 7,
      { align: 'center' }
    );
    
    // Número de página
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 15,
      pageHeight - 7,
      { align: 'right' }
    );
  }
};

