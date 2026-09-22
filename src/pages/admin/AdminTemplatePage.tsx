import React, { useState, useEffect } from 'react';
import { CertificateConfig, EventItem, Participant } from '../../types';
import { CertificateCanvas } from '../../components/CertificateCanvas';
import { apiClient } from '../../utils/apiClient';
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
  AlertCircle,
  Sliders,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw
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
  const [applyToAll, setApplyToAll] = useState(true);

  // Demo participant for live preview
  const demoParticipant: Participant = {
    id: 'demo-p',
    eventId: selectedKey,
    fullName: 'Siti Rahmawati, S.Pd.',
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
      const data = await apiClient.getAllEvents(adminToken);
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplate = async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getTemplateConfig(adminToken, key);
      setConfig(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat template.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!config) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const saved = await apiClient.saveTemplateConfig(adminToken, selectedKey, config, applyToAll);
      if (saved) {
        setConfig(saved);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan template.');
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

  const handleClearAllLogos = () => {
    if (!config) return;
    if (window.confirm('Hapus semua file logo dan sembunyikan kotak placeholder otomatis?')) {
      setConfig({
        ...config,
        logoUm: '',
        logoFs: '',
        logoDsi: '',
        hideLogoPlaceholders: true,
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

        {/* Switcher & Quick Save */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Pilih Konfigurasi:</span>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 outline-none focus:border-[#6B1724]"
            >
              <option value="global">🌐 Template Global Departemen (Otomatis ke Seluruh Kegiatan)</option>
              <optgroup label="Atau Khusus Kegiatan Tertentu:">
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {config && (
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-4 py-2 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          )}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#6B1724]" />
                  <span>1. Pengaturan & Upload Logo Resmi Institusi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah file logo resmi berformat PNG/JPG transparan. Anda dapat menghapus logo sewaktu-waktu atau menyembunyikan logo agar sertifikat hanya menampilkan teks institusi.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-clear-all-logos"
                  onClick={handleClearAllLogos}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Logo Otomatis</span>
                </button>
              </div>
            </div>

            {/* Quick Visibility Controls for Logos */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
                <input
                  type="checkbox"
                  id="chk-show-logos"
                  checked={config.showLogos !== false}
                  onChange={(e) => setConfig({ ...config, showLogos: e.target.checked })}
                  className="rounded border-slate-300 text-[#6B1724] focus:ring-[#6B1724]"
                />
                <span>Tampilkan Header Logo di Sertifikat</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  id="chk-hide-logo-placeholders"
                  checked={config.hideLogoPlaceholders === true}
                  onChange={(e) => setConfig({ ...config, hideLogoPlaceholders: e.target.checked })}
                  className="rounded border-slate-300 text-[#6B1724] focus:ring-[#6B1724]"
                />
                <span>Sembunyikan Kotak Placeholder jika logo kosong</span>
              </label>
            </div>

            {/* Logo Size / Scale Slider (Fitur Perbesar Logo) */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <Sliders className="w-4 h-4 text-[#6B1724]" />
                  <span className="font-bold text-slate-800">Perbesar / Skala Ukuran Logo:</span>
                  <span className="text-slate-500 text-[11px]">(Atur tinggi dan proporsi logo resmi institusi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#6B1724] bg-white px-2.5 py-1 rounded-md border border-amber-300 shadow-2xs">
                    {config.logoSize || 70} px
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, logoSize: 70 })}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  id="range-logo-size"
                  min="45"
                  max="130"
                  step="5"
                  value={config.logoSize || 70}
                  onChange={(e) => setConfig({ ...config, logoSize: Number(e.target.value) })}
                  className="w-full accent-[#6B1724] cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-500 mr-1 font-medium">Pilihan Cepat:</span>
                {[
                  { label: 'Standar (65px)', size: 65 },
                  { label: 'Sedang (75px)', size: 75 },
                  { label: 'Besar (90px)', size: 90 },
                  { label: 'Ekstra Besar (110px)', size: 110 },
                  { label: 'Maksimal (125px)', size: 125 },
                ].map((preset) => (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => setConfig({ ...config, logoSize: preset.size })}
                    className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer font-medium ${
                      (config.logoSize || 70) === preset.size
                        ? 'bg-[#6B1724] text-white border-[#6B1724] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* LOGO 1: UM */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Logo Universitas Negeri Malang</span>
                  <label className="text-[10px] text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showLogoUm !== false}
                      onChange={(e) => setConfig({ ...config, showLogoUm: e.target.checked })}
                      className="rounded border-slate-300 text-[#6B1724] focus:ring-[#6B1724] w-3 h-3"
                    />
                    <span>Aktif</span>
                  </label>
                </div>
                
                <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.logoUm ? (
                    <img src={config.logoUm} alt="Logo UM" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-2">
                      <Award className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                        {config.hideLogoPlaceholders ? '(Logo Disembunyikan)' : '[Placeholder Logo UM]'}
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
                      id="btn-remove-logo-um"
                      onClick={() => handleRemoveImage('logoUm')}
                      className="px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1 font-medium cursor-pointer"
                      title="Hapus Logo UM"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              {/* LOGO 2: FAKULTAS SASTRA */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-between text-center bg-slate-50/50">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Logo Fakultas Sastra</span>
                  <label className="text-[10px] text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showLogoFs !== false}
                      onChange={(e) => setConfig({ ...config, showLogoFs: e.target.checked })}
                      className="rounded border-slate-300 text-[#6B1724] focus:ring-[#6B1724] w-3 h-3"
                    />
                    <span>Aktif</span>
                  </label>
                </div>
                
                <div className="w-28 h-28 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3 bg-white">
                  {config.logoFs ? (
                    <img src={config.logoFs} alt="Logo FS" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center p-2">
                      <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                        {config.hideLogoPlaceholders ? '(Logo Disembunyikan)' : '[Placeholder Logo FS]'}
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
                      id="btn-remove-logo-fs"
                      onClick={() => handleRemoveImage('logoFs')}
                      className="px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1 font-medium cursor-pointer"
                      title="Hapus Logo FS"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
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
                        {config.hideLogoPlaceholders ? '(Lambang Kosong)' : '[Lambang Dept Sastra]'}
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
                      id="btn-remove-logo-dsi"
                      onClick={() => handleRemoveImage('logoDsi')}
                      className="px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1 font-medium cursor-pointer"
                      title="Hapus Lambang DSI"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: TANDA TANGAN & STEMPEL RESMI */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#6B1724]" />
                <span>2. Tanda Tangan & Stempel Resmi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Format PNG transparan dianjurkan. Gunakan slider di bawah untuk memperbesar atau memperkecil ukuran tanda tangan dan stempel sesuai kebutuhan visual sertifikat.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Tanda Tangan Digital Card */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Tanda Tangan Digital (PNG)</span>
                  <span className="text-[11px] font-semibold text-[#6B1724] bg-maroon-50 px-2 py-0.5 rounded border border-[#6B1724]/20">
                    Tinggi: {config.signatureSize || 70} px
                  </span>
                </div>
                
                <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 bg-white overflow-hidden">
                  {config.signatureImage ? (
                    <img 
                      src={config.signatureImage} 
                      alt="Tanda Tangan" 
                      style={{ maxHeight: `${Math.min(config.signatureSize || 70, 110)}px` }}
                      className="max-w-full object-contain transition-all" 
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Belum diunggah (menggunakan garis tanda tangan standar)
                    </span>
                  )}
                </div>

                {/* Slider Kontrol Ukuran TTD */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#6B1724]" />
                      <span>Atur Skala / Perbesar TTD:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800">{config.signatureSize || 70} px</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="range"
                      id="range-signature-size"
                      min="40"
                      max="140"
                      step="5"
                      value={config.signatureSize || 70}
                      onChange={(e) => setConfig({ ...config, signatureSize: Number(e.target.value) })}
                      className="w-full accent-[#6B1724] cursor-pointer"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-400 mr-1 text-[10px]">Preset:</span>
                    {[
                      { label: 'Kecil', size: 50 },
                      { label: 'Standar', size: 70 },
                      { label: 'Besar', size: 95 },
                      { label: 'Ekstra', size: 120 },
                    ].map((preset) => (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => setConfig({ ...config, signatureSize: preset.size })}
                        className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          (config.signatureSize || 70) === preset.size
                            ? 'bg-[#6B1724] text-white border-[#6B1724]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full pt-1">
                  <label className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload('signatureImage', e)}
                    />
                    <span>{config.signatureImage ? 'Ganti File TTD' : 'Upload File TTD (PNG)'}</span>
                  </label>
                  {config.signatureImage && (
                    <button
                      type="button"
                      id="btn-remove-signature"
                      onClick={() => handleRemoveImage('signatureImage')}
                      className="px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stempel Dinas Card */}
              <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Stempel Resmi Fakultas / Departemen</span>
                  <span className="text-[11px] font-semibold text-[#6B1724] bg-maroon-50 px-2 py-0.5 rounded border border-[#6B1724]/20">
                    Diameter: {config.stampSize || 75} px
                  </span>
                </div>
                
                <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 bg-white overflow-hidden">
                  {config.stampImage ? (
                    <img 
                      src={config.stampImage} 
                      alt="Stempel" 
                      style={{ maxHeight: `${Math.min(config.stampSize || 75, 110)}px` }}
                      className="max-w-full object-contain opacity-85 transition-all" 
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Opsional (stempel basah transparan)
                    </span>
                  )}
                </div>

                {/* Slider Kontrol Ukuran Stempel */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#6B1724]" />
                      <span>Atur Skala / Perbesar Stempel:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800">{config.stampSize || 75} px</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="range"
                      id="range-stamp-size"
                      min="40"
                      max="140"
                      step="5"
                      value={config.stampSize || 75}
                      onChange={(e) => setConfig({ ...config, stampSize: Number(e.target.value) })}
                      className="w-full accent-[#6B1724] cursor-pointer"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-400 mr-1 text-[10px]">Preset:</span>
                    {[
                      { label: 'Kecil', size: 55 },
                      { label: 'Standar', size: 75 },
                      { label: 'Besar', size: 100 },
                      { label: 'Ekstra', size: 125 },
                    ].map((preset) => (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => setConfig({ ...config, stampSize: preset.size })}
                        className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          (config.stampSize || 75) === preset.size
                            ? 'bg-[#6B1724] text-white border-[#6B1724]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full pt-1">
                  <label className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md cursor-pointer text-center">
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
                      id="btn-remove-stamp"
                      onClick={() => handleRemoveImage('stampImage')}
                      className="px-3 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
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

          {/* SAVE BUTTON & SYNC OPTIONS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="rounded border-slate-300 text-[#6B1724] focus:ring-[#6B1724] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Terapkan desain template ini ke seluruh kegiatan aktif (termasuk Workshop PKM)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6">
                Memastikan logo baru, perbesaran ukuran logo, tanda tangan, stempel, dan format langsung tampil di halaman publik mahasiswa.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0"
            >
              <Save className="w-4 h-4 text-[#C5A059]" />
              <span>{saving ? 'Menyimpan Template...' : 'SIMPAN PENGATURAN TEMPLATE'}</span>
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
