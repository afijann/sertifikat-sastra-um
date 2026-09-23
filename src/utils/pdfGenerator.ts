import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'qrcode';
import { CertificateConfig, EventItem, Participant } from '../types';
import { DEFAULT_UM_SVG, DEFAULT_FS_SVG } from './defaultLogos';

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
  config?: CertificateConfig;
}

/**
 * Renders an isolated, unconstrained 1123x794 px canvas clone to guarantee
 * 100% full capture without any cropping, clipping, or scrolling artifacts
 * regardless of mobile screen width, browser zoom, or responsive preview scales.
 */
async function captureCompleteCertificateCanvas(elementId: string): Promise<HTMLCanvasElement> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error('Elemen sertifikat untuk diunduh tidak ditemukan.');
  }

  // 1. Create an isolated off-screen wrapper attached directly to document body
  const wrapper = document.createElement('div');
  wrapper.id = 'certificate-isolated-export-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0';
  wrapper.style.top = '0';
  wrapper.style.width = '1123px';
  wrapper.style.height = '794px';
  wrapper.style.minWidth = '1123px';
  wrapper.style.minHeight = '794px';
  wrapper.style.overflow = 'visible';
  wrapper.style.zIndex = '-99999';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.opacity = '1';
  wrapper.style.visibility = 'visible';
  wrapper.style.backgroundColor = '#FFFFFF';

  // 2. Clone the certificate node
  const cloned = sourceElement.cloneNode(true) as HTMLElement;
  cloned.id = 'certificate-isolated-export-node';
  cloned.style.transform = 'none';
  cloned.style.width = '1123px';
  cloned.style.height = '794px';
  cloned.style.minWidth = '1123px';
  cloned.style.minHeight = '794px';
  cloned.style.maxWidth = '1123px';
  cloned.style.maxHeight = '794px';
  cloned.style.margin = '0';
  cloned.style.padding = '0';
  cloned.style.boxSizing = 'border-box';
  cloned.style.position = 'relative';
  cloned.style.overflow = 'hidden';

  wrapper.appendChild(cloned);
  document.body.appendChild(wrapper);

  try {
    // 3. Ensure all images inside the clone are fully rasterized and loaded
    const origImages = Array.from(sourceElement.getElementsByTagName('img'));
    const cloneImages = Array.from(cloned.getElementsByTagName('img'));

    for (let i = 0; i < cloneImages.length; i++) {
      const orig = origImages[i];
      const clone = cloneImages[i];
      if (orig && clone) {
        try {
          if (orig.complete && orig.naturalWidth > 0 && orig.naturalHeight > 0) {
            const canvasSnap = document.createElement('canvas');
            canvasSnap.width = orig.naturalWidth;
            canvasSnap.height = orig.naturalHeight;
            const ctx = canvasSnap.getContext('2d');
            if (ctx) {
              ctx.drawImage(orig, 0, 0);
              clone.src = canvasSnap.toDataURL('image/png');
            }
          } else {
            // If original image wasn't rendered, provide bulletproof default SVG
            const alt = (orig.alt || '').toLowerCase();
            const src = (orig.src || '').toLowerCase();
            if (alt.includes('malang') || src.includes('logo-um') || alt.includes('logo um')) {
              clone.src = DEFAULT_UM_SVG;
            } else if (alt.includes('sastra') || src.includes('logo-fs')) {
              clone.src = DEFAULT_FS_SVG;
            }
          }
        } catch (e) {
          console.warn('Canvas rasterization snapshot notice:', e);
        }
      }
    }

    // Ensure all clone images are completely decoded and ready in memory
    const images = Array.from(cloned.getElementsByTagName('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map(async (img) => {
          const imgEl = img as HTMLImageElement;
          if (imgEl.complete && imgEl.naturalWidth > 0) return;
          try {
            if (typeof imgEl.decode === 'function') {
              await imgEl.decode();
            }
          } catch {
            // ignore decode error if image is already handled
          }
        })
      );
    }

    // Small delay to allow browser font, CSS transforms and vector graphics to settle
    await new Promise((r) => setTimeout(r, 150));

    // 4. Render canvas with explicit full A4 landscape pixel bounds without viewport clipping
    const canvas = await html2canvas(cloned, {
      scale: 2.0, // 2246x1588 px gives crisp 300+ DPI print quality
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      backgroundColor: '#FFFFFF',
      logging: false,
      width: 1123,
      height: 794,
      windowWidth: 1400,
      windowHeight: 1000,
      onclone: (clonedDoc) => {
        // Expand the cloned iframe viewport completely so nothing gets clipped
        clonedDoc.documentElement.style.width = '1400px';
        clonedDoc.documentElement.style.minWidth = '1400px';
        clonedDoc.documentElement.style.height = '1000px';
        clonedDoc.documentElement.style.overflow = 'visible';
        clonedDoc.body.style.width = '1400px';
        clonedDoc.body.style.minWidth = '1400px';
        clonedDoc.body.style.height = '1000px';
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.position = 'relative';

        const wrapperNode = clonedDoc.getElementById('certificate-isolated-export-wrapper');
        if (wrapperNode) {
          wrapperNode.style.position = 'absolute';
          wrapperNode.style.left = '0px';
          wrapperNode.style.top = '0px';
          wrapperNode.style.width = '1123px';
          wrapperNode.style.height = '794px';
          wrapperNode.style.overflow = 'visible';
        }

        const target = clonedDoc.getElementById('certificate-isolated-export-node');
        if (target) {
          target.style.position = 'absolute';
          target.style.left = '0px';
          target.style.top = '0px';
          target.style.transform = 'none';
          target.style.width = '1123px';
          target.style.height = '794px';
          target.style.minWidth = '1123px';
          target.style.minHeight = '794px';
          target.style.maxWidth = '1123px';
          target.style.maxHeight = '794px';
          target.style.overflow = 'hidden';
        }
      },
    });

    return canvas;
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

export async function downloadCertificatePdf({
  elementId,
  participant,
}: GeneratePdfOptions): Promise<void> {
  const canvas = await captureCompleteCertificateCanvas(elementId);
  const imgData = canvas.toDataURL('image/png', 1.0);

  // A4 Landscape exact dimensions: 297mm x 210mm
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
}: GeneratePdfOptions): Promise<string> {
  const canvas = await captureCompleteCertificateCanvas(elementId);
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
