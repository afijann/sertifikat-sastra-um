import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';
import { CertificateConfig, EventItem, Participant } from '../types';

export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 240,
      margin: 1,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export interface GeneratePdfOptions {
  elementId: string;
  participant: Participant;
  event: EventItem;
  config: CertificateConfig;
}

export async function downloadCertificatePdf({
  elementId,
  participant,
  event,
}: GeneratePdfOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemen sertifikat untuk diunduh tidak ditemukan');
  }

  // Create canvas from DOM element with high quality 2.5x scale using html2canvas-pro
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.transform = 'none';
      }
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // A4 Landscape: 297mm x 210mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');

  // File naming: Sertifikat_[NamaPeserta]_[NomorSertifikat].pdf
  const safeName = sanitizeFilename(participant.fullName);
  const safeNumber = sanitizeFilename(participant.certificateNumber);
  const fileName = `Sertifikat_${safeName}_${safeNumber}.pdf`;

  pdf.save(fileName);
}

export async function getCertificatePdfBlobUrl({
  elementId,
  participant,
  event,
}: GeneratePdfOptions): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemen sertifikat tidak ditemukan');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.transform = 'none';
      }
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
