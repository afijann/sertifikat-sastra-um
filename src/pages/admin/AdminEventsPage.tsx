import React, { useState, useEffect } from 'react';
import { EventItem } from '../../types';
import { apiClient } from '../../utils/apiClient';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Power, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Building2, 
  X,
  AlertCircle
} from 'lucide-react';

interface AdminEventsPageProps {
  adminToken: string;
  initialSelectedEventId?: string;
  onSelectEventParticipants: (eventId: string) => void;
  onViewPublicEvent: (slug: string) => void;
}

export const AdminEventsPage: React.FC<AdminEventsPageProps> = ({
  adminToken,
  initialSelectedEventId,
  onSelectEventParticipants,
  onViewPublicEvent,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    location: 'Universitas Negeri Malang',
    description: '',
    organizer: 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
    certificatePrefix: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (initialSelectedEventId === 'new') {
      openCreateModal();
    } else if (initialSelectedEventId && events.length > 0) {
      const found = events.find(e => e.id === initialSelectedEventId);
      if (found) {
        openEditModal(found);
      }
    }
  }, [initialSelectedEventId, events.length]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAllEvents(adminToken);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentEventId(null);
    setFormData({
      title: '',
      subtitle: '',
      date: '21 September 2026',
      location: 'Universitas Negeri Malang',
      description: '',
      organizer: 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
      certificatePrefix: 'WS-PKM/DSI/FS-UM/2026/',
      status: 'active',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setModalMode('edit');
    setCurrentEventId(event.id);
    setFormData({
      title: event.title,
      subtitle: event.subtitle || '',
      date: event.date,
      location: event.location || '',
      description: event.description || '',
      organizer: event.organizer || '',
      certificatePrefix: event.certificatePrefix,
      status: event.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        await apiClient.createEvent(adminToken, formData);
      } else if (currentEventId) {
        await apiClient.updateEvent(adminToken, currentEventId, formData);
      }

      setIsModalOpen(false);
      loadEvents();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (eventId: string) => {
    try {
      await apiClient.toggleEventStatus(adminToken, eventId);
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (eventId: string, title: string) => {
    if (!window.confirm(`Hapus kegiatan "${title}"? Data peserta pada kegiatan ini juga akan dihapus.`)) {
      return;
    }
    try {
      await apiClient.deleteEvent(adminToken, eventId);
      loadEvents();
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

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.certificatePrefix.toLowerCase().includes(search.toLowerCase()) ||
    e.date.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
            Manajemen Kegiatan Akademik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola workshop, seminar, pelatihan, dan kegiatan lainnya berulang kali tanpa ubah kode
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>+ TAMBAH KEGIATAN BARU</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Cari kegiatan berdasarkan nama, prefix, atau tanggal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Events List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Memuat daftar kegiatan...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-700">Tidak ada kegiatan ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">
              {search ? 'Coba kata kunci pencarian lain.' : 'Buat kegiatan pertama dengan menekan tombol "+ Tambah Kegiatan Baru".'}
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Event Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      evt.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {evt.status === 'active' ? '● Aktif (Dibuka)' : '○ Nonaktif (Ditutup)'}
                  </span>

                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Prefix: <strong className="text-slate-900">{evt.certificatePrefix}</strong>
                  </span>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {evt.date}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-cinzel text-slate-900 leading-snug">
                  {evt.title}
                </h3>

                {evt.subtitle && (
                  <p className="text-xs text-slate-600 font-sans">
                    {evt.subtitle}
                  </p>
                )}

                {evt.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                )}
              </div>

              {/* Event Stats & Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Total Sertifikat:</span>
                  <span className="px-2.5 py-0.5 bg-[#6B1724]/10 text-[#6B1724] font-bold font-mono text-sm rounded-md">
                    {evt.participantCount || 0}
                  </span>
                </div>

                {/* Buttons Action Bar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Copy public link */}
                  <button
                    onClick={() => copyEventLink(evt.slug)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
                    title="Salin tautan formulir mahasiswa"
                  >
                    {copiedSlug === evt.slug ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>

                  {/* Public Preview */}
                  <button
                    onClick={() => onViewPublicEvent(evt.slug)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
                    title="Lihat Halaman Publik Mahasiswa"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {/* Participants */}
                  <button
                    onClick={() => onSelectEventParticipants(evt.id)}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors"
                    title="Lihat Daftar Peserta Kegiatan Ini"
                  >
                    Peserta ({evt.participantCount || 0})
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900"
                    title="Edit Data Kegiatan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Toggle Status */}
                  <button
                    onClick={() => handleToggleStatus(evt.id)}
                    className={`p-1.5 rounded transition-colors ${
                      evt.status === 'active'
                        ? 'text-amber-600 hover:bg-amber-50'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={evt.status === 'active' ? 'Nonaktifkan Kegiatan' : 'Aktifkan Kegiatan'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(evt.id, evt.title)}
                    className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                    title="Hapus Kegiatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            <div className="bg-[#6B1724] text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-base font-bold font-cinzel">
                {modalMode === 'create' ? '+ Tambah Kegiatan Baru' : 'Edit Data Kegiatan'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: WORKSHOP PROGRAM KREATIVITAS MAHASISWA (PKM)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subjudul / Tema Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mahasiswa Departemen Sastra Indonesia"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 21 September 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tempat / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Aula Gedung D8 FS UM & Daring"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prefix Nomor Sertifikat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: WS-PKM/DSI/FS-UM/2026/"
                  value={formData.certificatePrefix}
                  onChange={(e) => setFormData({ ...formData, certificatePrefix: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724]"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Format penomoran otomatis. Hasil: <span className="font-mono font-bold text-slate-700">{formData.certificatePrefix}001</span>, <span className="font-mono font-bold text-slate-700">{formData.certificatePrefix}002</span>, dst.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Penyelenggara
                </label>
                <textarea
                  rows={2}
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat mengenai tujuan atau lingkup kegiatan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Kegiatan
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="event-status"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                    />
                    <span className="font-semibold text-emerald-700">Aktif (Dapat diakses peserta)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="event-status"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                    />
                    <span className="text-slate-600">Nonaktif (Arsip / Ditutup)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold rounded-lg shadow cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Kegiatan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
