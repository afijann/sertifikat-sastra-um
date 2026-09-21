import React, { useState, useEffect } from 'react';
import { CertificateConfig, EventItem, Participant } from '../../types';
import { CertificateCanvas } from '../../components/CertificateCanvas';
import { 
  Palette, 
  Upload, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Building2, 
  Award, 
  ShieldCheck, 
  Stamp, 
  PenTool, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AdminTemplatePageProps {
  adminToken: string;
  initialEventId?: string;
}

export const AdminTemplatePage: React.FC<AdminTemplatePageProps> = ({
  adminToken,
  initialEventId,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>(initialEventId || 'global');
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo participant for live preview
  const demoParticipant: Participant = {
    id: 'demo-p',
    eventId: selectedKey,
    fullName: 'Afiyanti Nurul Hidayah, S.Pd.',
    certificateNumber: 'WS-PKM/DSI/FS-UM/2026/001',
    createdAt: new Date().toISOString(),
    verificationCode: 'VER-SAMPLE',
  };

  const demoEvent: EventItem = {
    id: 'demo-e',
    title: 'WORKSHOP PROGRAM KREATIVITAS MAHASISWA (PKM)',
    subtitle: 'Departemen Sastra Indonesia',
    description: '',
    date: '21 September 2026',
    location: 'Aula Gedung D8 FS Universitas Negeri Malang',
    organizer: 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
    certificatePrefix: 'WS-PKM/DSI/FS-UM/2026/',
    status: 'active',
    slug: 'workshop-pkm',
    counter: 1,
    createdAt: '',
    updatedAt: '',
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadTemplate(selectedKey);
  }, [selectedKey]);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplate = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = key === 'global'
        ? '/api/admin/template'
        : `/api/admin/template?eventId=${key}`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      } else {
        setError('Gagal memuat template.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat template.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/admin/template', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          key: selectedKey,
          config,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Gagal menyimpan konfigurasi.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  // Generic File Uploader for Logo UM, FS, DSI, Signature, Stamp
  const handleFileUpload = (
    field: 'logoUm' | 'logoFs' | 'logoDsi' | 'signatureImage' | 'stampImage',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && config) {
        setConfig({
          ...config,
          [field]: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: 'logoUm' | 'logoFs' | 'logoDsi' | 'signatureImage' | 'stampImage') => {
    if (config) {
      setConfig({
        ...config,
        [field]: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
            Pengaturan Template Sertifikat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sesuaikan identitas universitas, logo resmi, tanda tangan, stempel, dan layout visual
          </p>
        </div>

        {/* Switcher: Global Default vs Specific Event */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Pilih Konfigurasi:</span>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 outline-none focus:border-[#6B1724]"
          >
            <option value="global">★ Template Default Departemen</option>
            <optgroup label="Khusus Kegiatan:">
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Konfigurasi template berhasil disimpan dan langsung diterapkan ke seluruh sertifikat terkait.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading || !config ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Memuat template sertifikat...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* SECTION 1: UPLOAD LOGO RESMI INSTITUSI */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6B1724]" />
                <span>1. Upload Logo Resmi Institusi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuai panduan Departemen Sastra Indonesia, tidak menggunakan logo buatan AI. Silakan unggah file logo resmi berformat PNG/JPG. Jika belum diunggah, sistem menampilkan placeholder akademik yang rapi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* LOGO 1: UM */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 mb-2">Logo Universitas Negeri Malang</span>
                
                <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.logoUm ? (
                    <img src={config.logoUm} alt="Logo UM" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-2">
                      <Award className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                        [Placeholder Logo UM]
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload('logoUm', e)}
                    />
                    <span>{config.logoUm ? 'Ganti Logo' : 'Upload Logo UM'}</span>
                  </label>
                  {config.logoUm && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('logoUm')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* LOGO 2: FAKULTAS SASTRA */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 mb-2">Logo Fakultas Sastra</span>
                
                <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.logoFs ? (
                    <img src={config.logoFs} alt="Logo FS" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-2">
                      <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                        [Placeholder Logo Fakultas Sastra]
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload('logoFs', e)}
                    />
                    <span>{config.logoFs ? 'Ganti Logo' : 'Upload Logo FS'}</span>
                  </label>
                  {config.logoFs && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('logoFs')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* LOGO 3: DEPT SASTRA INDONESIA */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 mb-2">Identitas Dept Sastra Indonesia</span>
                
                <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.logoDsi ? (
                    <img src={config.logoDsi} alt="Logo DSI" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-2">
                      <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                        [Placeholder Lambang DSI]
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload('logoDsi', e)}
                    />
                    <span>{config.logoDsi ? 'Ganti Identitas' : 'Upload Logo DSI'}</span>
                  </label>
                  {config.logoDsi && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('logoDsi')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: TANDA TANGAN & STEMPEL RESMI */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#6B1724]" />
                <span>2. Tanda Tangan & Stempel Resmi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Format PNG transparan dianjurkan untuk tanda tangan digital dan stempel dinas agar tampak alami di lembar sertifikat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              {/* Tanda Tangan Digital */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 mb-2">Tanda Tangan Digital (PNG Transparan)</span>
                
                <div className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.signatureImage ? (
                    <img src={config.signatureImage} alt="Tanda Tangan" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Belum diunggah (menggunakan garis tanda tangan standar)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload('signatureImage', e)}
                    />
                    <span>{config.signatureImage ? 'Ganti TTD' : 'Upload File TTD (PNG)'}</span>
                  </label>
                  {config.signatureImage && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('signatureImage')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stempel Dinas */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 mb-2">Stempel Resmi Fakultas / Departemen</span>
                
                <div className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.stampImage ? (
                    <img src={config.stampImage} alt="Stempel" className="max-h-full max-w-full object-contain opacity-80" />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Opsional (stempel basah transparan)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full">
                  <label className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload('stampImage', e)}
                    />
                    <span>{config.stampImage ? 'Ganti Stempel' : 'Upload Stempel (PNG)'}</span>
                  </label>
                  {config.stampImage && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage('stampImage')}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: TEKS DAN PEJABAT PENANDATANGAN */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel">
                3. Teks Sertifikat & Data Penandatangan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur redaksi sertifikat dan informasi pejabat yang berwenang menandatangani dokumen
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Sertifikat
                </label>
                <input
                  type="text"
                  value={config.certificateTitle}
                  onChange={(e) => setConfig({ ...config, certificateTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kalimat Pembuka
                </label>
                <input
                  type="text"
                  value={config.recipientPrefix}
                  onChange={(e) => setConfig({ ...config, recipientPrefix: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kalimat Penghargaan / Peran
                </label>
                <input
                  type="text"
                  value={config.awardText}
                  onChange={(e) => setConfig({ ...config, awardText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Warna Utama Tema
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor || '#6B1724'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-10 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <div className="flex gap-2">
                    {[
                      { name: 'Dark Maroon (UM)', color: '#6B1724' },
                      { name: 'Navy Akademik', color: '#1E3A8A' },
                      { name: 'Dark Emerald', color: '#064E3B' },
                      { name: 'Charcoal', color: '#1E293B' },
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.color}
                        onClick={() => setConfig({ ...config, primaryColor: c.color })}
                        className="px-2 py-1 rounded text-[10px] font-semibold border flex items-center gap-1"
                        style={{
                          borderColor: config.primaryColor === c.color ? c.color : '#CBD5E1',
                          backgroundColor: config.primaryColor === c.color ? `${c.color}15` : 'transparent',
                        }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Penandatangan
                </label>
                <input
                  type="text"
                  value={config.signerName}
                  onChange={(e) => setConfig({ ...config, signerName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jabatan Penandatangan
                </label>
                <input
                  type="text"
                  value={config.signerPosition}
                  onChange={(e) => setConfig({ ...config, signerPosition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIP Penandatangan (Opsional)
                </label>
                <input
                  type="text"
                  value={config.signerNip || ''}
                  onChange={(e) => setConfig({ ...config, signerNip: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  QR Code Keaslian Dokumen
                </label>
                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showQr !== false}
                    onChange={(e) => setConfig({ ...config, showQr: e.target.checked })}
                    className="w-4 h-4 text-[#6B1724] rounded"
                  />
                  <span className="font-semibold text-slate-700">Tampilkan QR Code Verifikasi Otomatis pada Sertifikat</span>
                </label>
              </div>

            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">
              Perubahan template akan langsung tercermin pada preview sertifikat di bawah ini.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-xs rounded-lg shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#C5A059]" />
              <span>{saving ? 'Menyimpan...' : 'SIMPAN PENGATURAN TEMPLATE'}</span>
            </button>
          </div>

          {/* LIVE PREVIEW SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel">
                Live Preview Desain Sertifikat
              </h2>
              <span className="text-xs text-slate-400">
                Format Standar A4 Landscape
              </span>
            </div>

            <div className="w-full overflow-x-auto bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-center shadow-inner">
              <div className="shadow-2xl rounded overflow-hidden">
                <CertificateCanvas
                  id="template-live-preview-canvas"
                  participant={demoParticipant}
                  event={demoEvent}
                  config={config}
                />
              </div>
            </div>
          </div>

        </form>
      )}

    </div>
  );
};
