import React, { useState, useEffect } from 'react';
import { CertificateConfig } from '../../types';
import { Settings, Save, CheckCircle2, Building2, Shield, AlertCircle } from 'lucide-react';

interface AdminSettingsPageProps {
  adminToken: string;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ adminToken }) => {
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/template?eventId=global', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setConfig(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/admin/template', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          key: 'global',
          config,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Gagal menyimpan.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
          Pengaturan Global Institusi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Identitas resmi Universitas Negeri Malang sebagai dasar untuk seluruh kegiatan baru
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan identitas default institusi berhasil disimpan.</span>
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
          Memuat pengaturan...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-[#6B1724]" />
              <span>Hierarki Institusi Akademik</span>
            </h2>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Universitas
              </label>
              <input
                type="text"
                required
                value={config.universityName}
                onChange={(e) => setConfig({ ...config, universityName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Fakultas
              </label>
              <input
                type="text"
                required
                value={config.facultyName}
                onChange={(e) => setConfig({ ...config, facultyName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Departemen
              </label>
              <input
                type="text"
                required
                value={config.departmentName}
                onChange={(e) => setConfig({ ...config, departmentName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2 pb-2 border-b border-slate-100">
              <Shield className="w-4 h-4 text-[#6B1724]" />
              <span>Pejabat Penandatangan Default</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Pejabat
                </label>
                <input
                  type="text"
                  required
                  value={config.signerName}
                  onChange={(e) => setConfig({ ...config, signerName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Jabatan Resmi
                </label>
                <input
                  type="text"
                  required
                  value={config.signerPosition}
                  onChange={(e) => setConfig({ ...config, signerPosition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={config.signerNip || ''}
                  onChange={(e) => setConfig({ ...config, signerNip: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold rounded-lg shadow flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#C5A059]" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Default'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
