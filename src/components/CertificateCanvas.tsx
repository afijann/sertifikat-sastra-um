import React, { useEffect, useState } from 'react';
import { CertificateConfig, EventItem, Participant } from '../types';
import { generateQrDataUrl } from '../utils/pdfGenerator';
import {
  DEFAULT_UM_LOGO,
  DEFAULT_FS_LOGO,
  DEFAULT_DSI_LOGO,
  DEFAULT_SIGNATURE,
  DEFAULT_STAMP,
  DEFAULT_SIGNER_NAME,
  DEFAULT_SIGNER_POSITION,
  DEFAULT_SIGNER_NIP,
} from '../utils/defaultLogos';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CertificateCanvasProps {
  id?: string;
  participant: Participant;
  event: EventItem;
  config: CertificateConfig;
  scale?: number;
  className?: string;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  id = 'certificate-render-node',
  participant,
  event,
  config,
  scale = 1,
  className = '',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const verificationPath = `/verify/${encodeURIComponent(participant.certificateNumber)}`;
  const fullVerificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${verificationPath}`
    : `https://um.ac.id${verificationPath}`;

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(fullVerificationUrl).then(url => {
      if (isMounted) setQrCodeUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [fullVerificationUrl]);

  const primaryColor = config.primaryColor || '#6B1724'; // Maroon
  const secondaryColor = config.secondaryColor || '#C5A059'; // Gold

  const showLogos = config.showLogos !== false;
  const showLogoUm = showLogos && config.showLogoUm !== false;
  const showLogoFs = showLogos && config.showLogoFs !== false;
  const hidePlaceholders = config.hideLogoPlaceholders === true;

  const sigHeight = config.signatureSize || 70;
  const stmpSize = config.stampSize || 75;
  const logoHeight = config.logoSize || 70;
  const logoUmContainerWidth = Math.max(140, Math.round(logoHeight * 1.85));
  const logoFsContainerWidth = Math.max(90, Math.round(logoHeight * 1.35));
  const logoContainerHeight = Math.max(70, Math.round(logoHeight * 1.15));

  const finalLogoUm = config.logoUm !== undefined ? config.logoUm : DEFAULT_UM_LOGO;
  const finalLogoFs = config.logoFs !== undefined ? config.logoFs : DEFAULT_FS_LOGO;
  const effectiveLogoDsi = config.logoDsi;

  const effectiveEventTitle = config.eventName || event.title;
  const effectiveEventSubtitle = config.eventSubtitle !== undefined ? config.eventSubtitle : event.subtitle;
  const effectiveEventDate = config.eventDate || event.date;
  const effectiveEventLocation = config.eventLocation || event.location;
  const effectiveEventOrganizer = config.eventOrganizer || (event.organizer ? event.organizer : 'Departemen Sastra Indonesia, Fakultas Sastra, Universitas Negeri Malang');
  const locationPrefix = effectiveEventLocation
    ? `${effectiveEventLocation.split('&')[0].trim().split('Aula')[0].trim() || 'Malang'}, `
    : 'Malang, ';

  // Frame styles
  const frameStyle = config.frameStyle || 'classic-double';
  const titleSize = config.fontSizeTitle || 30;
  const nameSize = config.fontSizeName || 28;
  const bodySize = config.fontSizeBody || 13;

  return (
    <div
      id={id}
      className={`relative select-none overflow-hidden ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        // Exact A4 Landscape pixel ratio (1123px x 794px ~ 297mm x 210mm at 96DPI)
        width: '1123px',
        height: '794px',
        minWidth: '1123px',
        minHeight: '794px',
        transformOrigin: 'top left',
      }}
    >
      {/* Background Academic Guilloche / Pattern (subtle security watermark) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative Outer Border based on frameStyle */}
      <div 
        className="absolute inset-5 border-[3px] pointer-events-none"
        style={{ borderColor: primaryColor }}
      >
        {/* Inner Gold Frame */}
        <div 
          className="absolute inset-1.5 border-[1px] pointer-events-none"
          style={{ borderColor: secondaryColor }}
        />

        {/* Ornate Corner Accents */}
        {frameStyle !== 'minimal-modern' && (
          <>
            <div 
              className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4"
              style={{ borderColor: secondaryColor }}
            />
            <div 
              className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4"
              style={{ borderColor: secondaryColor }}
            />
            <div 
              className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4"
              style={{ borderColor: secondaryColor }}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4"
              style={{ borderColor: secondaryColor }}
            />
          </>
        )}
      </div>

      {/* Main Content Container with safe vertical spacing */}
      <div className="relative z-10 flex flex-col justify-between h-full px-12 sm:px-14 py-6 text-center">
        
        {/* TOP HEADER: Logos & Institutional Identity */}
        <div>
          <div 
            className="flex items-center justify-between gap-6 pb-2 border-b"
            style={{ borderColor: '#E2E8F0' }}
          >
            {/* Logo 1: Logo Universitas Negeri Malang */}
            {showLogoUm && finalLogoUm ? (
              <div 
                style={{ width: `${logoUmContainerWidth}px`, height: `${logoContainerHeight}px` }} 
                className="flex items-center justify-center shrink-0"
              >
                <img 
                  src={finalLogoUm} 
                  alt="Logo Universitas Negeri Malang" 
                  loading="eager"
                  decoding="sync"
                  style={{ maxHeight: `${logoHeight}px`, maxWidth: `${logoUmContainerWidth}px`, objectFit: 'contain' }}
                  className="object-contain"
                />
              </div>
            ) : (
              showLogos && <div style={{ width: `${logoUmContainerWidth}px`, height: `${logoContainerHeight}px` }} className="shrink-0" />
            )}


            {/* Institutional Identity Heading */}
            <div className="flex-1 text-center px-2">
              <h1 
                className="text-base font-extrabold tracking-widest font-cinzel uppercase"
                style={{ color: primaryColor }}
              >
                {config.universityName || 'UNIVERSITAS NEGERI MALANG'}
              </h1>
              <h2 
                className="text-sm font-bold tracking-wider uppercase font-cinzel"
                style={{ color: '#1E293B' }}
              >
                {config.facultyName || 'FAKULTAS SASTRA'}
              </h2>
              <h3 
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: primaryColor }}
              >
                {config.departmentName || 'DEPARTEMEN SASTRA INDONESIA'}
              </h3>
              <p 
                className="text-[10px] tracking-tight mt-0.5 font-sans"
                style={{ color: '#64748B' }}
              >
                Jalan Semarang 5, Malang 65145 | Laman: sastra.um.ac.id | Pos-el: sastra.indonesia.fs@um.ac.id
              </p>
            </div>

            {/* Logo 2 & 3: Logo Fakultas Sastra & Dept Sastra Indonesia */}
            {showLogoFs ? (
              <div 
                style={{ minWidth: `${logoFsContainerWidth}px`, height: `${logoContainerHeight}px` }} 
                className="flex items-center justify-center gap-2 shrink-0"
              >
                {finalLogoFs && (
                  <img 
                    src={finalLogoFs} 
                    alt="Logo Fakultas Sastra UM" 
                    loading="eager"
                    decoding="sync"
                    style={{ maxHeight: `${logoHeight}px`, maxWidth: `${Math.round(logoFsContainerWidth * 0.95)}px` }}
                    className="object-contain"
                  />
                )}
                {effectiveLogoDsi && (
                  <img 
                    src={effectiveLogoDsi} 
                    alt="Logo Departemen Sastra Indonesia" 
                    loading="eager"
                    decoding="sync"
                    style={{ maxHeight: `${logoHeight}px`, maxWidth: `${Math.round(logoFsContainerWidth * 0.95)}px` }}
                    className="object-contain"
                  />
                )}
                {!finalLogoFs && !effectiveLogoDsi && (!hidePlaceholders ? (
                  <div 
                    style={{ width: `${Math.min(76, logoHeight)}px`, height: `${Math.min(76, logoHeight)}px`, borderColor: secondaryColor, color: secondaryColor }}
                    className="rounded-full border-2 border-dashed flex flex-col items-center justify-center text-center p-1"
                  >
                    <ShieldCheck className="w-6 h-6 mb-0.5 opacity-80" />
                    <span className="text-[9px] font-bold leading-none tracking-tight">FAKULTAS SASTRA</span>
                  </div>
                ) : (
                  <div style={{ width: `${logoHeight}px`, height: `${logoHeight}px` }} />
                ))}
              </div>
            ) : (
              showLogos && <div style={{ width: `${logoFsContainerWidth}px`, height: `${logoContainerHeight}px` }} className="shrink-0" />
            )}
          </div>

          {/* Certificate Main Title */}
          <div className="mt-2.5">
            <h4 
              className="font-extrabold tracking-[0.25em] font-cinzel uppercase mb-1"
              style={{ color: primaryColor, fontSize: `${titleSize}px`, lineHeight: 1.15 }}
            >
              {config.certificateTitle || 'SERTIFIKAT'}
            </h4>
            <p 
              className="text-xs font-mono font-semibold tracking-wider"
              style={{ color: '#475569' }}
            >
              Nomor: <span className="font-bold" style={{ color: '#0F172A' }}>{participant.certificateNumber}</span>
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: Recipient & Honor */}
        <div className="my-auto py-1">
          <p 
            className="italic font-serif mb-1 tracking-wide"
            style={{ color: '#334155', fontSize: `${bodySize}px` }}
          >
            {config.recipientPrefix || 'Diberikan kepada:'}
          </p>

          {/* Recipient Full Name */}
          <div className="inline-block relative px-10 py-1">
            <div 
              className="font-bold font-playfair tracking-wide leading-tight"
              style={{ color: '#0F172A', fontSize: `${nameSize}px` }}
            >
              {participant.fullName}
            </div>
            {/* Subtle decorative baseline */}
            <div 
              className="w-3/4 mx-auto h-[1.5px] mt-1 opacity-70"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>

          {/* Award Text */}
          <p 
            className="mt-1.5 font-serif"
            style={{ color: '#334155', fontSize: `${bodySize}px` }}
          >
            {config.awardText || 'Sebagai peserta dalam kegiatan'}
          </p>

          {/* Event Title */}
          <div className="max-w-3xl mx-auto mt-1 px-4">
            <h5 
              className="text-lg font-bold font-cinzel leading-snug tracking-wide uppercase line-clamp-2"
              style={{ color: primaryColor }}
            >
              {effectiveEventTitle}
            </h5>
            {effectiveEventSubtitle && (
              <p 
                className="text-xs font-sans mt-0.5 font-medium"
                style={{ color: '#475569' }}
              >
                {effectiveEventSubtitle}
              </p>
            )}
          </div>

          {/* Organizer Statement */}
          <div 
            className="text-[11px] font-sans mt-1.5 max-w-xl mx-auto leading-relaxed"
            style={{ color: '#475569' }}
          >
            yang diselenggarakan oleh{' '}
            <span className="font-semibold" style={{ color: '#1E293B' }}>
              {effectiveEventOrganizer}
            </span>
          </div>
        </div>

        {/* BOTTOM SECTION: Date, Signature, Stamp & Official QR Code */}
        <div className="pt-2 border-t" style={{ borderColor: '#F1F5F9' }}>
          <div className="flex items-end justify-between px-2">
            
            {/* Left: Security QR Code & Official Verification Notice */}
            <div className="flex items-center gap-3 text-left w-64 shrink-0">
              {config.showQr !== false && (
                <div 
                  className="p-1 rounded shrink-0"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Verifikasi Sertifikat" 
                      className="w-18 h-18"
                    />
                  ) : (
                    <div 
                      className="w-18 h-18 flex items-center justify-center text-[10px]"
                      style={{ backgroundColor: '#F1F5F9', color: '#94A3B8' }}
                    >
                      QR Code
                    </div>
                  )}
                </div>
              )}
              <div>
                <div 
                  className="flex items-center gap-1 text-[11px] font-bold"
                  style={{ color: '#065F46' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#059669' }} />
                  <span>Sertifikat Sah & Resmi</span>
                </div>
                <p 
                  className="text-[9px] leading-tight mt-0.5"
                  style={{ color: '#64748B' }}
                >
                  Pindai kode QR untuk memverifikasi keaslian dokumen pada sistem resmi Universitas Negeri Malang.
                </p>
                <p 
                  className="text-[8px] font-mono mt-1"
                  style={{ color: '#94A3B8' }}
                >
                  ID: {participant.verificationCode || 'VALID'}
                </p>
              </div>
            </div>

            {/* Center: Official University Seal Watermark or Badge */}
            <div className="flex flex-col items-center justify-center opacity-85 shrink-0">
              <div 
                className="w-13 h-13 rounded-full border-2 flex items-center justify-center p-1"
                style={{ borderColor: secondaryColor }}
              >
                <div 
                  className="w-10 h-10 rounded-full border flex items-center justify-center text-center p-0.5"
                  style={{ borderColor: secondaryColor, color: primaryColor }}
                >
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <span 
                className="text-[8px] font-bold tracking-widest uppercase mt-1 font-cinzel"
                style={{ color: '#64748B' }}
              >
                Departemen Sastra Indonesia
              </span>
            </div>

            {/* Right: Place, Date, Signer Name, Position, Stamp & Signature */}
            <div className="text-center w-72 sm:w-80 max-w-[340px] shrink-0">
              <p 
                className="text-[11px] font-sans mb-0.5"
                style={{ color: '#334155' }}
              >
                {locationPrefix}
                <span className="font-medium">{effectiveEventDate}</span>
              </p>
              <p 
                className="text-[11px] font-semibold mb-0.5 font-sans"
                style={{ color: '#1E293B' }}
              >
                {config.signerPosition || DEFAULT_SIGNER_POSITION}
              </p>

              {/* Signature Graphic Area with official stamp */}
              <div 
                className="relative mx-auto flex items-center justify-center my-0.5"
                style={{ 
                  height: `${sigHeight}px`, 
                  minHeight: '52px', 
                  width: `${Math.max(240, Math.round(sigHeight * 2.3))}px` 
                }}
              >
                {/* Official Stamp behind/overlay signature */}
                {(config.stampImage || DEFAULT_STAMP) && (
                  <img 
                    src={config.stampImage || DEFAULT_STAMP} 
                    alt="Stempel Resmi" 
                    style={{
                      height: `${stmpSize}px`,
                      width: `${stmpSize}px`,
                      left: `-${Math.round(stmpSize * 0.22)}px`,
                      objectFit: 'contain',
                    }}
                    className="absolute top-1/2 -translate-y-1/2 opacity-85 pointer-events-none select-none z-0"
                  />
                )}

                {/* Digital Signature */}
                <img 
                  src={config.signatureImage || DEFAULT_SIGNATURE} 
                  alt="Tanda Tangan Digital" 
                  style={{ 
                    maxHeight: `${sigHeight}px`, 
                    maxWidth: '100%',
                    objectFit: 'contain',
                  }}
                  className="relative z-10"
                />
              </div>

              {/* Signer Name & NIP */}
              <p 
                className="text-[11px] font-bold underline underline-offset-2 font-serif"
                style={{ color: '#0F172A' }}
              >
                {config.signerName || DEFAULT_SIGNER_NAME}
              </p>
              <p 
                className="text-[9px] font-sans mt-0.5"
                style={{ color: '#475569' }}
              >
                {config.signerNip || DEFAULT_SIGNER_NIP}
              </p>
            </div>


          </div>
        </div>

      </div>
    </div>
  );
};
