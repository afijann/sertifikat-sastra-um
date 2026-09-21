import React, { useState, useEffect } from 'react';
import { EventItem, CertificateConfig, Participant } from '../types';
import { CertificateCanvas } from '../components/CertificateCanvas';
import { downloadCertificatePdf } from '../utils/pdfGenerator';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Download, 
  Calendar, 
  Building2, 
  ArrowLeft,
  FileCheck2,
  Lock
} from 'lucide-react';

interface PublicVerificationPageProps {
  initialCertNumber?: string;
  onBackToHome: () => void;
}

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({
  initialCertNumber,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialCertNumber || '');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    participant?: Participant;
    event?: EventItem;
    templateConfig?: CertificateConfig;
    verifiedAt?: string;
    message?: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (initialCertNumber) {
      performVerification(initialCertNumber);
    }
  }, [initialCertNumber]);

  const performVerification = async (certNumber: string) => {
    const cleanNumber = certNumber.trim();
    if (!cleanNumber) return;

    setLoading(true);
    setSearched(true);
    setShowPreview(false);

    try {
      const encoded = encodeURIComponent(cleanNumber);
      const res = await fetch(`/api/public/verify/${encoded}`);
      const data = await res.json();

      if (res.ok && data.valid) {
        setResult({
          valid: true,
          participant: data.participant,
          event: data.event,
          templateConfig: data.templateConfig,
          verifiedAt: data.verifiedAt,
        });
      } else {
        setResult({
          valid: false,
          message: data.message || 'Nomor sertifikat tidak terdaftar atau tidak valid.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setResult({
        valid: false,
        message: 'Gagal terhubung ke pangkalan data verifikasi Universitas Negeri Malang.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(searchQuery);
  };

  const handleDownload = async () => {
    if (!result?.participant || !result?.event || !result?.templateConfig) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf({
        elementId: 'verification-cert-preview',
        participant: result.participant,
        event: result.event,
        config: result.templateConfig,
      });
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh sertifikat.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1724] hover:underline mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Buat Sertifikat</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sistem Verifikasi Ijazah & Sertifikat Resmi</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#6B1724] uppercase font-cinzel">
          Verifikasi Keaslian Sertifikat
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          Departemen Sastra Indonesia, Fakultas Sastra, Universitas Negeri Malang
        </p>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="Masukkan nomor sertifikat (Contoh: WS-PKM/DSI/FS-UM/2026/001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-slate-300 focus:border-[#6B1724] focus:ring-2 focus:ring-[#6B1724]/20 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memeriksa...' : 'Verifikasi Sekarang'}
          </button>
        </form>
      </div>

      {/* VERIFICATION RESULT */}
      {searched && !loading && result && (
        <div>
          {result.valid && result.participant && result.event ? (
            /* VALID STATE */
            <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-lg overflow-hidden animate-fadeIn">
              
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/40">
                    <ShieldCheck className="w-8 h-8 text-emerald-200" />
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase bg-emerald-900/60 px-2 py-0.5 rounded font-mono font-semibold">
                      VERIFIKASI DIGITAL BERHASIL
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-wide font-cinzel">
                      SERTIFIKAT VALID & RESMI
                    </h2>
                  </div>
                </div>

                <div className="text-right text-xs text-emerald-100 font-mono">
                  <div>Terdaftar Pada Database</div>
                  <div>Universitas Negeri Malang</div>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                  
                  {/* Participant Name */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Nama Peserta
                    </span>
                    <p className="text-xl font-bold text-slate-900 font-serif">
                      {result.participant.fullName}
                    </p>
                  </div>

                  {/* Certificate Number */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Nomor Sertifikat
                    </span>
                    <p className="text-base sm:text-lg font-mono font-bold text-[#6B1724]">
                      {result.participant.certificateNumber}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      Kode Verifikasi: {result.participant.verificationCode}
                    </span>
                  </div>

                  {/* Event Title */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Kegiatan
                    </span>
                    <p className="text-base sm:text-lg font-bold text-slate-900 font-cinzel">
                      {result.event.title}
                    </p>
                    {result.event.subtitle && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        {result.event.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Tanggal Pelaksanaan
                    </span>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Calendar className="w-4 h-4 text-[#6B1724]" />
                      <span>{result.event.date}</span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Penyelenggara Resmi
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <Building2 className="w-4 h-4 text-[#6B1724]" />
                      <span>
                        Departemen Sastra Indonesia<br />
                        Fakultas Sastra, Universitas Negeri Malang
                      </span>
                    </div>
                  </div>

                </div>

                {/* Actions: Toggle Preview & Download PDF */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4 text-[#6B1724]" />
                    <span>{showPreview ? 'Sembunyikan Preview' : 'Tampilkan Dokumen Asli'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-6 py-2.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloading ? 'Mengunduh...' : 'Unduh Salinan Sertifikat (PDF)'}</span>
                  </button>
                </div>

                {/* Optional Preview Canvas if toggled */}
                {showPreview && result.templateConfig && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="w-full overflow-x-auto bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-center">
                      <div className="shadow-lg rounded overflow-hidden">
                        <CertificateCanvas
                          id="verification-cert-preview"
                          participant={result.participant}
                          event={result.event}
                          config={result.templateConfig}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* INVALID STATE */
            <div className="bg-white rounded-xl border-2 border-red-400 shadow-md p-8 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-red-700 font-cinzel mb-2">
                SERTIFIKAT TIDAK DITEMUKAN / TIDAK VALID
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                {result.message || 'Nomor sertifikat yang Anda masukkan tidak terdaftar pada pangkalan data resmi Departemen Sastra Indonesia, Fakultas Sastra, Universitas Negeri Malang.'}
              </p>
              <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 max-w-md mx-auto text-left">
                <strong>Tips pemeriksaan:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Pastikan penulisan karakter, garis miring, dan tanda hubung sudah sesuai.</li>
                  <li>Periksa kembali kode QR pada lembar sertifikat fisik/digital Anda.</li>
                  <li>Hubungi bagian administrasi Departemen Sastra Indonesia UM jika Anda yakin nomor tersebut benar.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
