import React, { useState, useEffect } from 'react';
import { EventItem, Participant, CertificateConfig } from '../../types';
import { CertificateCanvas } from '../../components/CertificateCanvas';
import { downloadCertificatePdf } from '../../utils/pdfGenerator';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Trash2, 
  FileSpreadsheet, 
  ExternalLink,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface AdminParticipantsPageProps {
  adminToken: string;
  initialEventFilter?: string;
  onNavigateToVerify: (certNumber: string) => void;
}

export const AdminParticipantsPage: React.FC<AdminParticipantsPageProps> = ({
  adminToken,
  initialEventFilter,
  onNavigateToVerify,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventFilter || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Preview / Download states
  const [previewParticipant, setPreviewParticipant] = useState<Participant | null>(null);
  const [previewEvent, setPreviewEvent] = useState<EventItem | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateConfig | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regenerateSuccess, setRegenerateSuccess] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedEventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, partsRes] = await Promise.all([
        fetch('/api/admin/events', {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch(`/api/admin/participants${selectedEventId ? `?eventId=${selectedEventId}` : ''}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (eventsRes.ok && partsRes.ok) {
        const eventsData = await eventsRes.json();
        const partsData = await partsRes.json();
        setEvents(eventsData);
        setParticipants(partsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (participant: Participant) => {
    try {
      // Find event
      const event = events.find(e => e.id === participant.eventId) || {
        id: participant.eventId,
        title: participant.eventTitle || 'Kegiatan Akademik',
        subtitle: '',
        description: '',
        date: participant.eventDate || '',
        location: 'Universitas Negeri Malang',
        organizer: 'Departemen Sastra Indonesia FS UM',
        certificatePrefix: '',
        status: 'active',
        slug: '',
        counter: 0,
        createdAt: '',
        updatedAt: '',
      } as EventItem;

      // Get template config
      const res = await fetch(`/api/admin/template?eventId=${participant.eventId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const template = res.ok ? await res.json() : null;

      setPreviewParticipant(participant);
      setPreviewEvent(event);
      setPreviewTemplate(template);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async (participantId: string) => {
    setRegeneratingId(participantId);
    setRegenerateSuccess(null);
    try {
      const res = await fetch(`/api/admin/participants/${participantId}/regenerate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRegenerateSuccess(`Sertifikat untuk ${data.participant.fullName} berhasil diregenerasi tanpa mengubah nomor sertifikat.`);
        // Reload list
        loadData();
      } else {
        alert(data.error || 'Gagal meregenerasi.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus sertifikat untuk peserta "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/participants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadFromPreview = async () => {
    if (!previewParticipant || !previewEvent || !previewTemplate) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf({
        elementId: 'admin-preview-cert-canvas',
        participant: previewParticipant,
        event: previewEvent,
        config: previewTemplate,
      });
    } catch (err) {
      console.error(err);
      alert('Gagal membuat PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const exportCsv = () => {
    const url = `/api/admin/export/csv${selectedEventId ? `?eventId=${selectedEventId}` : ''}`;
    window.open(url, '_blank');
  };

  const filteredParticipants = participants.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
            Daftar Peserta & Sertifikat Diterbitkan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pangkalan data peserta dengan nomor registrasi unik dan status verifikasi
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>EXPORT CSV / EXCEL</span>
        </button>
      </div>

      {regenerateSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{regenerateSuccess}</span>
          </div>
          <button onClick={() => setRegenerateSuccess(null)} className="text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama peserta atau nomor sertifikat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#6B1724] outline-none"
          />
        </div>

        {/* Filter Event */}
        <div className="sm:w-72">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#6B1724] outline-none bg-white font-medium text-slate-700"
          >
            <option value="">Semua Kegiatan (Seluruh Pangkalan Data)</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Peserta</th>
                <th className="py-3 px-4">Nomor Sertifikat</th>
                <th className="py-3 px-4">Kegiatan</th>
                <th className="py-3 px-4">Waktu Dibuat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data peserta...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada data peserta yang cocok.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-serif text-[13px]">
                        {p.fullName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {p.verificationCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#6B1724]">
                      {p.certificateNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {p.eventTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View & Download */}
                        <button
                          onClick={() => handleOpenPreview(p)}
                          title="Lihat & Download Sertifikat"
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-[#6B1724]" />
                          <span>Lihat</span>
                        </button>

                        {/* Regenerate with same certificate number */}
                        <button
                          onClick={() => handleRegenerate(p.id)}
                          disabled={regeneratingId === p.id}
                          title="Generate Ulang menggunakan template terbaru (Nomor Sertifikat Tetap Sama)"
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-semibold text-[11px] flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${regeneratingId === p.id ? 'animate-spin' : ''}`} />
                          <span>Regenerate</span>
                        </button>

                        {/* Verification Link */}
                        <button
                          onClick={() => onNavigateToVerify(p.certificateNumber)}
                          title="Buka Halaman Verifikasi Resmi"
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(p.id, p.fullName)}
                          title="Hapus Peserta"
                          className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
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

      {/* PREVIEW & DOWNLOAD MODAL */}
      {previewModalOpen && previewParticipant && previewEvent && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#6B1724] text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-20">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-cinzel">
                  Preview Sertifikat: {previewParticipant.fullName}
                </h3>
                <p className="text-[11px] text-[#F5E6CC] font-mono">
                  {previewParticipant.certificateNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFromPreview}
                  disabled={downloading}
                  className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#b59048] text-[#4A0E18] font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading ? 'Mengunduh...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Scaled Certificate */}
            <div className="p-4 sm:p-6 bg-slate-100 flex items-center justify-center overflow-x-auto">
              <div className="shadow-2xl rounded overflow-hidden">
                <CertificateCanvas
                  id="admin-preview-cert-canvas"
                  participant={previewParticipant}
                  event={previewEvent}
                  config={previewTemplate}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <span>Sertifikat siap dicetak dalam format A4 Landscape</span>
              <button
                onClick={() => {
                  setPreviewModalOpen(false);
                  onNavigateToVerify(previewParticipant.certificateNumber);
                }}
                className="text-[#6B1724] font-semibold hover:underline"
              >
                Cek Link Verifikasi Publik →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
