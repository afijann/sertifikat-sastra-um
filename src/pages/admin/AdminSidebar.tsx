import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Award, 
  Palette, 
  Settings, 
  LogOut, 
  ExternalLink,
  Building2
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onViewPublic: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  onViewPublic,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Kegiatan', icon: CalendarDays },
    { id: 'participants', label: 'Peserta', icon: Users },
    { id: 'certificates', label: 'Sertifikat', icon: Award },
    { id: 'template', label: 'Template', icon: Palette },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#4A0E18] text-white flex flex-col justify-between shrink-0 border-r border-[#6B1724]">
      <div>
        {/* Institutional Branding */}
        <div className="p-5 border-b border-[#6B1724]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase font-mono text-[#F5E6CC]/80">
                PANEL KELOLA
              </div>
              <div className="text-xs font-bold font-cinzel leading-tight">
                Sastra Indonesia UM
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-menu-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#6B1724] text-white border-l-4 border-[#C5A059] shadow-sm'
                    : 'text-white/80 hover:bg-[#6B1724]/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-white/60'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#6B1724]/60 space-y-1.5">
        <button
          onClick={onViewPublic}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#F5E6CC] hover:bg-white/5 transition-all text-left"
        >
          <ExternalLink className="w-4 h-4 text-[#C5A059]" />
          <span>Lihat Halaman Publik</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
};
