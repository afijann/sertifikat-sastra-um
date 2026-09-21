import React, { useState, useEffect } from 'react';
import { EventItem, DashboardStats } from '../../types';
import { apiClient } from '../../utils/apiClient';
import { 
  CalendarDays, 
  Award, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Edit, 
  Users, 
  Power, 
  Trash2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardPageProps {
  adminToken: string;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onViewPublicEvent: (slug: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminToken,
  onNavigateTab,
  onViewPublicEvent,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, eventsData] = await Promise.all([
        apiClient.getDashboardStats(adminToken),
        apiClient.getAllEvents(adminToken),
      ]);

      setStats(statsData);
      setEvents(eventsData);
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kendala saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (eventId: string) => {
    try {
      await apiClient.toggleEventStatus(adminToken, eventId);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus kegiatan "${title}" beserta seluruh sertifikat terkait? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    try {
      await apiClient.deleteEvent(adminToken, eventId);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const copyEventLink = (slug: string) => {
    const url = `${window.location.origin}/event/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const activeEvent = events.find(e => e.status === 'active');

  return (
    <div className="space-y-6">
      
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
            Ringkasan Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Departemen Sastra Indonesia, Fakultas Sastra, Universitas Negeri Malang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-dash-add-event"
            onClick={() => onNavigateTab('events', 'new')}
            className="px-4 py-2.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-xs rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>+ TAMBAH KEGIATAN</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Kegiatan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Kegiatan
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#6B1724]/10 flex items-center justify-center text-[#6B1724]">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-cinzel text-slate-900 mt-2">
            {stats ? stats.totalEvents : '-'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Semua kegiatan terdaftar
          </span>
        </div>

        {/* Total Sertifikat */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Sertifikat
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/20 flex items-center justify-center text-[#9A7B38]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-cinzel text-slate-900 mt-2">
            {stats ? stats.totalCertificates : '-'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Diterbitkan untuk peserta
          </span>
        </div>

        {/* Sertifikat Hari Ini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sertifikat Hari Ini
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-cinzel text-slate-900 mt-2">
            {stats ? stats.certificatesToday : '-'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Aktivitas 24 jam terakhir
          </span>
        </div>

        {/* Kegiatan Aktif */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kegiatan Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-cinzel text-emerald-700 mt-2">
            {stats ? stats.activeEvents : '-'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Dapat diakses mahasiswa
          </span>
        </div>

      </div>

      {/* ACTIVE EVENT HIGHLIGHT CARD */}
      {activeEvent && (
        <div className="bg-gradient-to-r from-[#6B1724] to-[#4A0E18] text-white rounded-xl p-5 shadow-sm border-l-4 border-[#C5A059] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5E6CC]">
                KEGIATAN AKTIF UTAMA SAAT INI
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-cinzel">
              {activeEvent.title}
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Prefix: <span className="font-mono font-bold text-[#F5E6CC]">{activeEvent.certificatePrefix}</span> • Tanggal: {activeEvent.date}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyEventLink(activeEvent.slug)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Salin tautan untuk mahasiswa"
            >
              {copiedSlug === activeEvent.slug ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Salin Link Mahasiswa</span>
                </>
              )}
            </button>

            <button
              onClick={() => onViewPublicEvent(activeEvent.slug)}
              className="px-3 py-2 bg-[#C5A059] hover:bg-[#b59048] text-[#4A0E18] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Form</span>
            </button>
          </div>
        </div>
      )}

      {/* TABLE: DAFTAR KEGIATAN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-cinzel">
              Daftar Kegiatan Departemen
            </h3>
            <p className="text-xs text-slate-500">
              Kelola status, template, dan peserta untuk setiap kegiatan akademik
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('events')}
            className="text-xs font-bold text-[#6B1724] hover:underline"
          >
            Lihat Semua Kegiatan →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Kegiatan</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Sertifikat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada kegiatan yang dibuat. Klik "+ TAMBAH KEGIATAN" di atas.
                  </td>
                </tr>
              ) : (
                events.map((evt, idx) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-serif text-[13px]">
                        {evt.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Prefix: {evt.certificatePrefix}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {evt.date}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(evt.id)}
                        title="Klik untuk mengubah status aktif/nonaktif"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          evt.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${evt.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        <span>{evt.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {evt.participantCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigateTab('events', evt.id)}
                          title="Edit Kegiatan"
                          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigateTab('participants', evt.id)}
                          title="Lihat Peserta & Sertifikat"
                          className="p-1.5 hover:bg-slate-200 rounded text-blue-600 hover:text-blue-800"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(evt.id)}
                          title={evt.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          className={`p-1.5 hover:bg-slate-200 rounded ${
                            evt.status === 'active' ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          title="Hapus Kegiatan"
                          className="p-1.5 hover:bg-red-100 rounded text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
