import React from 'react';
import { Award, CheckCircle2, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  activeEventTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdminLoggedIn,
  onAdminLogout,
  activeEventTitle,
}) => {
  return (
    <header className="bg-[#6B1724] text-white border-b-2 border-[#C5A059] shadow-md sticky top-0 z-50">
      {/* Top Academic Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Identity */}
        <div 
          onClick={() => onNavigate('student')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-brand-logo"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 border border-[#C5A059] flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-all">
            <Award className="w-6 h-6 text-[#C5A059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-wider uppercase font-semibold text-[#F5E6CC] font-cinzel">
                UNIVERSITAS NEGERI MALANG
              </span>
              <span className="text-[10px] bg-[#C5A059] text-[#4A0E18] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                FAKULTAS SASTRA
              </span>
            </div>
            <div className="text-sm font-bold tracking-wide font-cinzel">
              Departemen Sastra Indonesia
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Public Certificate Generator */}
          <button
            id="nav-btn-student"
            onClick={() => onNavigate('student')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'student'
                ? 'bg-[#C5A059] text-[#4A0E18] shadow-xs'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Buat Sertifikat</span>
          </button>

          {/* Verification Link */}
          <button
            id="nav-btn-verify"
            onClick={() => onNavigate('verify')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'verify'
                ? 'bg-[#C5A059] text-[#4A0E18] shadow-xs'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verifikasi</span>
          </button>

          {/* Admin Dashboard / Login */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/20">
              <button
                id="nav-btn-admin-dash"
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView.startsWith('admin')
                    ? 'bg-white text-[#6B1724] shadow-xs'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Admin</span>
              </button>

              <button
                id="nav-btn-logout"
                onClick={onAdminLogout}
                title="Keluar dari Akun Admin"
                className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-red-800/60 transition-all text-xs flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              id="nav-btn-login"
              onClick={() => onNavigate('admin-login')}
              className={`ml-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 border border-[#C5A059]/50 ${
                currentView === 'admin-login'
                  ? 'bg-white text-[#6B1724]'
                  : 'text-[#F5E6CC] hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </button>
          )}
        </nav>
      </div>

      {/* Active Event ticker bar if available */}
      {activeEventTitle && (
        <div className="bg-[#4A0E18] text-white/90 text-[11px] py-1 px-4 text-center font-medium border-t border-[#8B2635] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span>Kegiatan Aktif Terbuka:</span>
          <strong className="text-[#F5E6CC] truncate max-w-lg">{activeEventTitle}</strong>
        </div>
      )}
    </header>
  );
};
