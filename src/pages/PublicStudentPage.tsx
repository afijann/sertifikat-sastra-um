import React, { useState, useEffect } from 'react';
import { EventItem, CertificateConfig, Participant } from '../types';
import { CertificateCanvas } from '../components/CertificateCanvas';
import { downloadCertificatePdf } from '../utils/pdfGenerator';
import { apiClient } from '../utils/apiClient';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Sparkles
} from 'lucide-react';

interface PublicStudentPageProps {
  initialEventSlug?: string;
  onNavigateToVerify: (certNumber?: string) => void;
  onNavigateToAdmin: () => void;
}

export const PublicStudentPage: React.FC<PublicStudentPageProps> = ({
  initialEventSlug,
  onNavigateToVerify,
  onNavigateToAdmin,
}) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [templateConfig, setTemplateConfig] = useState<CertificateConfig | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success & Preview States
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  // Load Event (either by slug or active event)
  useEffect(() => {
    fetchEventData();
  }, [initialEventSlug]);

  const fetchEventData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = initialEventSlug
        ? await apiClient.getEventBySlug(initialEventSlug)
        : await apiClient.getActiveEvent();

      if (data.event) {
        setEvent(data.event);
        setTemplateConfig(data.templateConfig);
      } else {
        setEvent(null);
        setError(data.message || 'Saat ini belum ada kegiatan yang sedang dibuka untuk penerbitan sertifikat.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi gangguan jaringan saat memuat kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    // Clean & validate input
    const cleanName = fullName.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 3) {
      setError('Mohon masukkan nama lengkap minimal 3 karakter.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setIsDuplicate(false);
    setDuplicateMessage(null);

    try {
      const data = await apiClient.generateCertificate(event.id, cleanName);

      setParticipant(data.participant);
      if (data.templateConfig) {
        setTemplateConfig(data.templateConfig);
      }

      if (data.isDuplicate) {
        setIsDuplicate(true);
        setDuplicateMessage('Nama ini sudah memiliki sertifikat untuk kegiatan ini.');
      } else {
        // Trigger celebratory confetti for new certificate
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6B1724', '#C5A059', '#1E293B'],
          });
        } catch (_) {}
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Maaf, sertifikat belum dapat dibuat. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!participant || !event || !templateConfig) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf({
        elementId: 'student-certificate-preview-canvas',
        participant,
        event,
        config: templateConfig,
      });
    } catch (err: any) {
      console.error('Download error:', err);
      alert('Gagal mengunduh file PDF. Silakan coba gunakan tombol cetak browser atau refresh halaman.');
    } finally {
      setDownloading(false);
    }
  };

  const resetForm = () => {
    setParticipant(null);
    setFullName('');
    setIsDuplicate(false);
    setDuplicateMessage(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#6B1724] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700 font-cinzel">
          Memuat Sistem Sertifikat Universitas Negeri Malang...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      {/* INSTITUTIONAL HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6B1724]/10 text-[#6B1724] text-xs font-semibold uppercase tracking-wider mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span>Universitas Negeri Malang</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#6B1724] uppercase tracking-wide font-cinzel">
          FAKULTAS SASTRA • DEPARTEMEN SASTRA INDONESIA
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Layanan Resmi Penerbitan dan Verifikasi Sertifikat Kegiatan
        </p>
      </div>

      {/* NO ACTIVE EVENT NOTICE */}
      {!event && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm text-center">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h2 className="text-base font-bold text-amber-900 mb-1">
            Tidak Ada Kegiatan yang Terbuka
          </h2>
          <p className="text-sm text-amber-800 max-w-md mx-auto mb-4">
            {error || 'Saat ini tidak ada kegiatan aktif yang dibuka untuk klaim sertifikat. Silakan hubungi panitia kegiatan.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onNavigateToAdmin}
              className="text-xs font-semibold text-[#6B1724] hover:underline"
            >
              Masuk sebagai Administrator
            </button>
          </div>
        </div>
      )}

      {/* EVENT ACTIVE & CERTIFICATE GENERATION */}
      {event && (
        <div className="space-y-6">
          
          {/* EVENT CARD */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#6B1724] to-[#8B2635] text-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold bg-[#C5A059] text-[#4A0E18] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Kegiatan Resmi
                </span>
                <span className="text-xs text-[#F5E6CC] flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {event.date}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-cinzel leading-snug tracking-wide uppercase">
                {event.title}
              </h2>
              {event.subtitle && (
                <p className="text-xs sm:text-sm text-[#F5E6CC] mt-1.5 font-sans opacity-95">
                  {event.subtitle}
                </p>
              )}
            </div>

            {/* Event Description & Location Meta */}
            <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#6B1724] shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>Penyelenggara: <strong>Departemen Sastra Indonesia FS UM</strong></span>
              </div>
            </div>
          </div>

          {/* VIEW: RESULT & DOWNLOAD PREVIEW */}
          {participant && templateConfig ? (
            <div className="bg-white rounded-xl border-2 border-[#C5A059] shadow-lg p-6 space-y-6 animate-fadeIn">
              
              {/* Status Banner */}
              {isDuplicate ? (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm">
                      {duplicateMessage || 'Nama ini sudah memiliki sertifikat untuk kegiatan ini.'}
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Nomor sertifikat tetap sama untuk menjaga keaslian dan mencegah duplikasi data. Anda dapat langsung mengunduh salinan PDF di bawah ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-emerald-900 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm">
                        Sertifikat Berhasil Diterbitkan!
                      </h3>
                      <p className="text-xs text-emerald-700">
                        Nomor Registrasi Resmi: <strong className="font-mono">{participant.certificateNumber}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Terverifikasi Sistem</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Download PDF & Verification */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-slate-500">Nama Penerima Sertifikat:</p>
                  <p className="text-base font-bold text-slate-900 font-serif">
                    {participant.fullName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <button
                    id="btn-download-pdf"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 sm:flex-none px-6 py-3 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyiapkan PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>DOWNLOAD SERTIFIKAT (PDF)</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-check-verify"
                    onClick={() => onNavigateToVerify(participant.certificateNumber)}
                    className="px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                    title="Buka halaman verifikasi keaslian sertifikat"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#6B1724]" />
                    <span>Cek Verifikasi QR</span>
                  </button>
                </div>
              </div>

              {/* PREVIEW CONTAINER */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    Preview Sertifikat Resmi (A4 Landscape)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Siap Dicetak & Disimpan
                  </span>
                </div>

                {/* Scaled Responsive Viewport for Certificate Canvas */}
                <div className="w-full overflow-x-auto bg-slate-200/70 p-2 sm:p-4 rounded-xl border border-slate-300 flex justify-center shadow-inner">
                  <div 
                    className="transform-gpu origin-top transition-transform"
                    style={{
                      // Scale down dynamically for smaller screens while keeping exact 1123x794 px render
                      maxWidth: '100%',
                    }}
                  >
                    <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
                      <CertificateCanvas
                        id="student-certificate-preview-canvas"
                        participant={participant}
                        event={event}
                        config={templateConfig}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Reset Link */}
              <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-[#6B1724] font-medium flex items-center gap-1 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Buat Sertifikat untuk Nama Lain</span>
                </button>
                <button
                  onClick={() => onNavigateToVerify(participant.certificateNumber)}
                  className="text-xs text-[#6B1724] hover:underline font-semibold"
                >
                  Verifikasi Sertifikat Ini →
                </button>
              </div>

            </div>
          ) : (
            /* VIEW: INPUT FORM */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              
              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  Penerbitan Sertifikat Peserta
                </h3>
                <p className="text-sm text-slate-600">
                  Silakan masukkan <strong className="text-slate-800">Nama Lengkap</strong> Anda (beserta gelar jika dikehendaki) untuk mendapatkan sertifikat resmi.
                </p>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SIMPLE SINGLE-FIELD FORM */}
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label 
                    htmlFor="fullName" 
                    className="block text-xs sm:text-sm font-bold tracking-wider text-slate-800 uppercase mb-2"
                  >
                    NAMA LENGKAP <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Siti Rahmawati, S.Pd."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3.5 text-base sm:text-lg rounded-lg border-2 border-slate-300 focus:border-[#6B1724] focus:ring-2 focus:ring-[#6B1724]/20 outline-none transition-all placeholder:text-slate-400 font-serif font-medium bg-slate-50/50 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Pastikan penulisan nama dan gelar sudah benar. Data akan dicetak langsung ke lembar sertifikat resmi.
                  </p>
                </div>

                <button
                  id="btn-create-certificate"
                  type="submit"
                  disabled={submitting || !fullName.trim()}
                  className="w-full py-4 px-6 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-cinzel tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>SEDANG MEMBUAT SERTIFIKAT...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5 text-[#C5A059]" />
                      <span>BUAT SERTIFIKAT</span>
                    </>
                  )}
                </button>
              </form>

              {/* FOOTER VERIFICATION LINK */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <button
                  onClick={() => onNavigateToVerify()}
                  className="text-slate-600 hover:text-[#6B1724] flex items-center gap-1 underline underline-offset-4"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6B1724]" />
                  <span>Verifikasi Sertifikat</span>
                </button>
                <span>Departemen Sastra Indonesia • FS UM</span>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Security notice */}
      <div className="mt-12 text-center text-xs text-slate-400">
        <p>
          Dokumen sertifikat yang diterbitkan melalui portal ini sah secara akademik dan terdaftar pada pangkalan data Universitas Negeri Malang.
        </p>
      </div>

    </div>
  );
};
