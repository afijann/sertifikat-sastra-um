import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Username dan password wajib diisi.');
      setLoading(false);
      return;
    }

    try {
      const result = await apiClient.login(cleanUser, cleanPass);
      onLoginSuccess(result.token, result.user);
    } catch (err: any) {
      console.warn('Login error:', err);
      setError(err.message || 'Gagal login. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-wrapper" className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#6B1724] text-white p-8 text-center relative">
          <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-[#C5A059] flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-[#C5A059]" />
          </div>
          <span className="text-[10px] tracking-widest uppercase font-mono bg-white/10 px-2.5 py-0.5 rounded text-[#F5E6CC]">
            PORTAL ADMINISTRATOR
          </span>
          <h1 className="text-xl font-bold font-cinzel mt-2">
            Departemen Sastra Indonesia
          </h1>
          <p className="text-xs text-white/80 mt-1">
            Fakultas Sastra • Universitas Negeri Malang
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          
          {error && (
            <div id="admin-login-error" className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label 
                htmlFor="admin-username"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Username / Email Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#6B1724] focus:ring-2 focus:ring-[#6B1724]/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi rahasia"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#6B1724] focus:ring-2 focus:ring-[#6B1724]/20 outline-none"
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>MASUK KE DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Button */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              id="btn-back-to-home"
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              ← Kembali ke Halaman Utama Mahasiswa
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
