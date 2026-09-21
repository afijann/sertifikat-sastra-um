import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [username, setUsername] = useState('sastraindonesia');
  const [password, setPassword] = useState('sastrajaya');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Username atau password tidak cocok.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat otentikasi admin.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername('sastraindonesia');
    setPassword('sastrajaya');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
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
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-center gap-2">
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
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sastraindonesia"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#6B1724] focus:ring-2 focus:ring-[#6B1724]/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#6B1724] focus:ring-2 focus:ring-[#6B1724]/20 outline-none font-mono"
                />
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

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-left text-xs text-slate-600 mb-4">
              <span className="font-bold text-slate-700 block mb-1">
                Kredensial Default:
              </span>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span>User: <strong>sastraindonesia</strong></span>
                <span>Pass: <strong>sastrajaya</strong></span>
              </div>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="mt-2 text-[11px] text-[#6B1724] font-semibold hover:underline block"
              >
                Gunakan kredensial ini otomatis
              </button>
            </div>

            <button
              onClick={onBackToHome}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Kembali ke Halaman Mahasiswa
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
