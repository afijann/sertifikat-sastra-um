import React, { useState, useEffect } from 'react';
import { Participant, EventItem, CertificateConfig } from '../../types';
import { CertificateCanvas } from '../../components/CertificateCanvas';
import { downloadCertificatePdf } from '../../utils/pdfGenerator';
import { 
  Award, 
  Search, 
  Download, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  Filter,
  X
} from 'lucide-react';

interface AdminCertificatesPageProps {
  adminToken: string;
  onNavigateToVerify: (certNumber: string) => void;
}

export const AdminCertificatesPage: React.FC<AdminCertificatesPageProps> = ({
  adminToken,
  onNavigateToVerify,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Preview Modal
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<CertificateConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        setEvents(await eventsRes.json());
        setParticipants(await partsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = async (p: Participant) => {
    const evt = events.find(e => e.id === p.eventId) || {
      id: p.eventId,
      title: p.eventTitle || 'Kegiatan Akademik',
      subtitle: '',
      description: '',
      date: p.eventDate || '',
      location: 'Universitas Negeri Malang',
      organizer: 'Departemen Sastra Indonesia FS UM',
      certificatePrefix: '',
      status: 'active',
      slug: '',
      counter: 0,
      createdAt: '',
      updatedAt: '',
    } as EventItem;

    const res = await fetch(`/api/admin/template?eventId=${p.eventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const template = res.ok ? await res.json() : null;

    setActiveParticipant(p);
    setActiveEvent(evt);
    setActiveTemplate(template);
    setIsModalOpen(true);
  };

  const handleDownload = async () => {
    if (!activeParticipant || !activeEvent || !activeTemplate) return;
    setDownloading(true);
    try {
      await downloadCertificatePdf({
        elementId: 'cert-gallery-modal-canvas',
        participant: activeParticipant,
        event: activeEvent,
        config: activeTemplate,
      });
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh sertifikat.');
    } finally {
      setDownloading(false);
    }
  };

  const filtered = participants.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.certificateNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-slate-900">
            Pusat Sertifikat Diterbitkan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Galeri sertifikat elektronik resmi beserta verifikasi QR Code
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama peserta atau nomor sertifikat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#6B1724] outline-none"
          />
        </div>

        <div className="sm:w-72">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#6B1724] outline-none bg-white text-slate-700 font-medium"
          >
            <option value="">Semua Kegiatan</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Memuat sertifikat...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-sm text-slate-700">Tidak ada sertifikat ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Top */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Terverifikasi</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {p.verificationCode}
                  </span>
                </div>

                <div className="font-bold text-slate-900 font-serif text-base mb-1">
                  {p.fullName}
                </div>

                <div className="text-[11px] font-mono font-semibold text-[#6B1724]">
                  {p.certificateNumber}
                </div>

                <div className="text-xs text-slate-600 mt-2 truncate font-medium">
                  {p.eventTitle}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="p-3 bg-slate-50 flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigateToVerify(p.certificateNumber)}
                  className="text-slate-600 hover:text-[#6B1724] font-medium flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verifikasi</span>
                </button>

                <button
                  onClick={() => openPreview(p)}
                  className="px-3 py-1.5 bg-[#6B1724] hover:bg-[#4A0E18] text-white font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Lihat & PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PREVIEW */}
      {isModalOpen && activeParticipant && activeEvent && activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            
            <div className="bg-[#6B1724] text-white p-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-sm font-bold font-cinzel">
                  {activeParticipant.fullName}
                </h3>
                <span className="text-[11px] font-mono text-[#F5E6CC]">
                  {activeParticipant.certificateNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#b59048] text-[#4A0E18] font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloading ? 'Menyiapkan...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-100 flex items-center justify-center overflow-x-auto">
              <div className="shadow-2xl rounded overflow-hidden">
                <CertificateCanvas
                  id="cert-gallery-modal-canvas"
                  participant={activeParticipant}
                  event={activeEvent}
                  config={activeTemplate}
                />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
