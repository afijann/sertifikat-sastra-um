import React, { useState, useEffect } from 'react';
import { CertificateConfig } from '../../types';
import { apiClient } from '../../utils/apiClient';
import { Settings, Save, CheckCircle2, Building2, Shield, AlertCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminSettingsPageProps {
  adminToken: string;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ adminToken }) => {
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTemplateConfig(adminToken, 'global');
      setConfig(data);
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
      await apiClient.saveTemplateConfig(adminToken, 'global', config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPass.length < 5) {
      setPassError('Password baru minimal 5 karakter.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setPassLoading(true);
    try {
      await apiClient.changePassword(adminToken, currentPass, newPass);

      setPassSuccess(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
          Pengaturan Global Institusi & Keamanan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Kelola identitas resmi Departemen Sastra Indonesia UM dan kata sandi akses administrator
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
        <div className="space-y-6">
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
                id="btn-save-global-settings"
                disabled={saving}
                className="px-6 py-2.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold rounded-lg shadow flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#C5A059]" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Default'}</span>
              </button>
            </div>

          </form>

          {/* Dedicated Password Change Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel flex items-center gap-2 pb-2 border-b border-slate-100">
                <KeyRound className="w-4 h-4 text-[#6B1724]" />
                <span>Keamanan Akun & Ubah Kata Sandi Administrator</span>
              </h2>
              <p className="text-slate-500 mt-1">
                Ubah kata sandi akun admin secara berkala agar tidak dapat diakses oleh pihak yang tidak berwenang.
              </p>
            </div>

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kata sandi admin berhasil diperbarui dan aman tersimpan.</span>
              </div>
            )}

            {passError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Lama (Opsional jika baru)
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimal 5 karakter baru"
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-500 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPass ? 'Sembunyikan' : 'Perlihatkan'} karakter</span>
                </button>

                <button
                  type="submit"
                  id="btn-update-password"
                  disabled={passLoading}
                  className="px-5 py-2 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold rounded-lg shadow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{passLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
