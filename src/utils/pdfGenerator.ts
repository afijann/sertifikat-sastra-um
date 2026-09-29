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

/**
 * Preload an image asset completely before PDF generation begins.
 * Ensures the image is fully downloaded and ready in memory.
 */
export async function preloadImage(src?: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(new Image());
      return;
    }
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('Image asset preload warning for:', src.slice(0, 60));
      resolve(img);
    };
    img.src = src;
  });
}

export interface GeneratePdfOptions {
  currentConfig?: CertificateConfig;
  config?: CertificateConfig;
  elementId?: string;
  participant?: Participant;
  event?: EventItem;
  fileName?: string;
}

/**
 * Renders an isolated, unconstrained 1123x794 px canvas clone based on currentConfig
 * to guarantee 100% full capture without any cropping, clipping, or scrolling artifacts.
 */
export async function captureCertificateCanvas(
  currentConfig: CertificateConfig,
  elementId: string = 'certificate-render-node'
): Promise<HTMLCanvasElement> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`Elemen sertifikat (${elementId}) untuk diunduh tidak ditemukan.`);
  }

  // Preload all explicit images from currentConfig (never static fallbacks)
  const assetsToLoad = [
    currentConfig.logoUm,
    currentConfig.logoFs,
    currentConfig.logoDsi,
    currentConfig.signatureImage,
    currentConfig.stampImage,
  ].filter(Boolean) as string[];
  await Promise.all(assetsToLoad.map((src) => preloadImage(src)));

  // Ensure all web fonts are loaded and ready before canvas capture
  if (document.fonts && typeof document.fonts.ready?.then === 'function') {
    try {
      await document.fonts.ready;
    } catch {
      // Non-fatal font readiness error
    }
  }

  // Ensure all live DOM images in source element are loaded
  const liveImages = Array.from(sourceElement.getElementsByTagName('img'));
  if (liveImages.length > 0) {
    await Promise.all(
      liveImages.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 2000);
        });
      })
    );
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
  wrapper.style.overflow = 'hidden';
  wrapper.style.zIndex = '999999';
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
    // 3. Ensure image sources are faithfully mirrored from the rendered DOM
    const origImages = Array.from(sourceElement.getElementsByTagName('img'));
    const cloneImages = Array.from(cloned.getElementsByTagName('img'));

    for (let i = 0; i < cloneImages.length; i++) {
      const orig = origImages[i];
      const clone = cloneImages[i];
      if (orig && clone) {
        const activeSrc = orig.currentSrc || orig.src;
        if (activeSrc) {
          clone.src = activeSrc;
        }
        // Remove crossorigin on data: or blob: URIs to avoid canvas taint
        if (clone.src.startsWith('data:') || clone.src.startsWith('blob:')) {
          clone.removeAttribute('crossorigin');
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
            // decode handled
          }
        })
      );
    }

    // Small delay to allow fonts and transforms to settle
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
          wrapperNode.style.opacity = '1';
          wrapperNode.style.visibility = 'visible';
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

/**
 * REFACTORED PDF GENERATOR UTILITY:
 * Accepts `currentConfig` as a required parameter instead of reading from static constants,
 * ensuring that every download uses the latest state.
 */
export async function generatePDF(
  currentConfigOrOptions: CertificateConfig | GeneratePdfOptions,
  maybeOptions?: GeneratePdfOptions
): Promise<jsPDF> {
  // Resolve currentConfig and options flexibly
  let currentConfig: CertificateConfig;
  let options: GeneratePdfOptions;

  if ('certificateTitle' in currentConfigOrOptions) {
    currentConfig = currentConfigOrOptions as CertificateConfig;
    options = maybeOptions || {};
  } else {
    options = currentConfigOrOptions as GeneratePdfOptions;
    currentConfig = options.currentConfig || options.config!;
  }

  if (!currentConfig) {
    throw new Error('Konfigurasi sertifikat terkini (currentConfig) wajib disertakan untuk menghasilkan PDF.');
  }

  const elementId = options.elementId || 'certificate-render-node';
  const canvas = await captureCertificateCanvas(currentConfig, elementId);
  const imgData = canvas.toDataURL('image/png', 1.0);

  // A4 Landscape exact dimensions: 297mm x 210mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
  return pdf;
}

/**
 * Downloads the certificate PDF using the active `currentConfig`.
 * Ensures every download reflects the latest state.
 */
export async function downloadCertificatePdf(
  currentConfigOrOptions: CertificateConfig | GeneratePdfOptions,
  maybeOptions?: GeneratePdfOptions
): Promise<void> {
  let currentConfig: CertificateConfig;
  let options: GeneratePdfOptions;

  if ('certificateTitle' in currentConfigOrOptions) {
    currentConfig = currentConfigOrOptions as CertificateConfig;
    options = maybeOptions || {};
  } else {
    options = currentConfigOrOptions as GeneratePdfOptions;
    currentConfig = (options.currentConfig || options.config)!;
  }

  if (!currentConfig) {
    throw new Error('Konfigurasi sertifikat terkini (currentConfig) wajib disertakan untuk mengunduh PDF.');
  }

  const pdf = await generatePDF(currentConfig, options);

  // Determine filename dynamically from participant or config
  let fileName = options.fileName;
  if (!fileName) {
    if (options.participant) {
      const safeName = sanitizeFilename(options.participant.fullName);
      const safeNumber = sanitizeFilename(options.participant.certificateNumber);
      fileName = `Sertifikat_${safeName}_${safeNumber}.pdf`;
    } else {
      const safeEvent = sanitizeFilename(currentConfig.eventName || 'Sertifikat');
      fileName = `Sertifikat_${safeEvent}_${Date.now()}.pdf`;
    }
  }

  pdf.save(fileName);
}

/**
 * Returns a Blob URL for previewing or embedding the PDF.
 */
export async function getCertificatePdfBlobUrl(
  currentConfigOrOptions: CertificateConfig | GeneratePdfOptions,
  maybeOptions?: GeneratePdfOptions
): Promise<string> {
  let currentConfig: CertificateConfig;
  let options: GeneratePdfOptions;

  if ('certificateTitle' in currentConfigOrOptions) {
    currentConfig = currentConfigOrOptions as CertificateConfig;
    options = maybeOptions || {};
  } else {
    options = currentConfigOrOptions as GeneratePdfOptions;
    currentConfig = (options.currentConfig || options.config)!;
  }

  const pdf = await generatePDF(currentConfig, options);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
