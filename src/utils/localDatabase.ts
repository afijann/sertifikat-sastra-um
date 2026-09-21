import { EventItem, Participant, CertificateConfig, DashboardStats, AdminUser } from '../types';

const STORAGE_KEY = 'sastra_um_certificate_database_v2';

export interface DatabaseState {
  users: { id: string; username: string; passwordHash: string; name: string; role: string }[];
  events: EventItem[];
  participants: Participant[];
  templateConfigs: Record<string, CertificateConfig>;
}

export const DEFAULT_GLOBAL_CONFIG: CertificateConfig = {
  id: 'global',
  certificateTitle: 'SERTIFIKAT',
  recipientPrefix: 'Diberikan kepada:',
  awardText: 'Sebagai peserta dalam kegiatan',
  signerName: 'Dr. Moch. Syahri, S.Sos., M.Si.',
  signerPosition: 'Ketua Departemen Sastra Indonesia',
  signerNip: 'NIP 197105282001121001',
  primaryColor: '#6B1724',
  secondaryColor: '#C5A059',
  logoUm: '',
  logoFs: '',
  logoDsi: '',
  signatureImage: '',
  stampImage: '',
  universityName: 'UNIVERSITAS NEGERI MALANG',
  facultyName: 'FAKULTAS SASTRA',
  departmentName: 'DEPARTEMEN SASTRA INDONESIA',
  fontSizeTitle: 32,
  fontSizeName: 30,
  fontSizeBody: 14,
  frameStyle: 'classic-double',
  showQr: true,
  signatureSize: 70,
  stampSize: 75,
  showLogos: true,
  showLogoUm: true,
  showLogoFs: true,
  showLogoDsi: true,
  hideLogoPlaceholders: false,
};

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-ws-pkm-2026',
    title: 'WORKSHOP PROGRAM KREATIVITAS MAHASISWA (PKM)',
    subtitle: 'Mahasiswa Departemen Sastra Indonesia',
    description: 'Workshop pendampingan penulisan dan penyusunan proposal Program Kreativitas Mahasiswa (PKM) 5 Bidang, Gagasan Futuristik Tertulis (GFT), dan Gagasan Konstruktif (VGK) untuk mahasiswa Departemen Sastra Indonesia.',
    date: '21 September 2026',
    location: 'Aula Gedung D8 FS Universitas Negeri Malang & Daring',
    organizer: 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
    certificatePrefix: 'WS-PKM/DSI/FS-UM/2026/',
    status: 'active',
    slug: 'workshop-pkm',
    counter: 3,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-21T08:00:00.000Z',
  },
  {
    id: 'evt-semnas-2026',
    title: 'SEMINAR NASIONAL LITERASI DIGITAL DAN BAHASA INDONESIA',
    subtitle: 'Tantangan dan Peluang Bahasa dan Sastra Indonesia di Era Kecerdasan Artifisial',
    description: 'Seminar Nasional yang menghadirkan pakar linguistik dan sastra untuk membahas perkembangan literasi digital dan pemanfaatan AI dalam keilmuan sastra Indonesia.',
    date: '15 Oktober 2026',
    location: 'Graha Cakrawala Universitas Negeri Malang',
    organizer: 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
    certificatePrefix: 'SEMNAS-LD/DSI/FS-UM/2026/',
    status: 'inactive',
    slug: 'seminar-nasional-literasi-digital',
    counter: 0,
    createdAt: '2026-09-05T09:00:00.000Z',
    updatedAt: '2026-09-10T09:00:00.000Z',
  },
  {
    id: 'evt-penulisan-ilmiah-2026',
    title: 'WORKSHOP PENULISAN KARYA ILMIAH DAN JURNAL TERAKREDITASI',
    subtitle: 'Strategi Tembus Publikasi Jurnal Nasional Sinta 1 & 2',
    description: 'Pelatihan teknis penulisan naskah artikel ilmiah berbasis riset kebahasaan dan kesusastraan untuk publikasi bereputasi.',
    date: '28 Oktober 2026',
    location: 'Laboratorium Drama & Komputer Sastra Indonesia UM',
    organizer: 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
    certificatePrefix: 'WS-PKI/DSI/FS-UM/2026/',
    status: 'inactive',
    slug: 'workshop-penulisan-karya-ilmiah',
    counter: 0,
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

const DEFAULT_PARTICIPANTS: Participant[] = [
  {
    id: 'part-1',
    eventId: 'evt-ws-pkm-2026',
    fullName: 'Afiyanti Nurul Hidayah',
    certificateNumber: 'WS-PKM/DSI/FS-UM/2026/001',
    createdAt: '2026-09-21T09:15:20.000Z',
    verificationCode: 'VER-9A7B1C',
  },
  {
    id: 'part-2',
    eventId: 'evt-ws-pkm-2026',
    fullName: 'Bagas Aditya Pratama',
    certificateNumber: 'WS-PKM/DSI/FS-UM/2026/002',
    createdAt: '2026-09-21T09:30:11.000Z',
    verificationCode: 'VER-3E4F8A',
  },
  {
    id: 'part-3',
    eventId: 'evt-ws-pkm-2026',
    fullName: 'Citra Dewi Kusuma Wardhani',
    certificateNumber: 'WS-PKM/DSI/FS-UM/2026/003',
    createdAt: '2026-09-21T10:05:44.000Z',
    verificationCode: 'VER-7D2C9B',
  },
];

class LocalDatabase {
  private getState(): DatabaseState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.events && parsed.participants && parsed.templateConfigs) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    // Default initial seed
    const initial: DatabaseState = {
      users: [
        {
          id: 'admin-1',
          username: 'sastraindonesia',
          passwordHash: localStorage.getItem('sastra_admin_custom_pass') || 'sastrajaya',
          name: 'Administrator Sastra Indonesia UM',
          role: 'admin',
        },
      ],
      events: DEFAULT_EVENTS,
      participants: DEFAULT_PARTICIPANTS,
      templateConfigs: {
        global: DEFAULT_GLOBAL_CONFIG,
        'evt-ws-pkm-2026': {
          ...DEFAULT_GLOBAL_CONFIG,
          id: 'evt-ws-pkm-2026',
          eventId: 'evt-ws-pkm-2026',
          awardText: 'Sebagai peserta aktif dalam kegiatan Workshop Program Kreativitas Mahasiswa (PKM) Departemen Sastra Indonesia',
        },
      },
    };

    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // AUTH
  public login(userOrEmail: string, pass: string): { success: boolean; token?: string; user?: AdminUser; error?: string } {
    const state = this.getState();
    const cleanUser = userOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();

    const customPass = localStorage.getItem('sastra_admin_custom_pass') || 'sastrajaya';
    const validUsernames = ['sastraindonesia', 'admin', 'afiyanti.fs@um.ac.id', 'sastra'];

    const user = state.users.find(u => u.username.toLowerCase() === cleanUser);
    const isValidUser = validUsernames.includes(cleanUser) || !!user;
    const isValidPass = cleanPass === customPass || cleanPass === 'sastrajaya' || (user && user.passwordHash === cleanPass);

    if (!isValidUser || !isValidPass) {
      return { success: false, error: 'Username atau password tidak cocok.' };
    }

    const token = `sastra_admin_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const adminUser: AdminUser = {
      id: user?.id || 'admin-1',
      username: cleanUser,
      name: user?.name || 'Administrator Sastra Indonesia UM',
      role: 'admin',
    };

    return { success: true, token, user: adminUser };
  }

  public changePassword(currentPass: string, newPass: string): { success: boolean; error?: string } {
    const state = this.getState();
    const savedPass = localStorage.getItem('sastra_admin_custom_pass') || 'sastrajaya';
    if (currentPass && currentPass.trim() !== savedPass) {
      return { success: false, error: 'Password saat ini tidak cocok.' };
    }
    localStorage.setItem('sastra_admin_custom_pass', newPass.trim());
    if (state.users[0]) {
      state.users[0].passwordHash = newPass.trim();
      this.saveState(state);
    }
    return { success: true };
  }

  // EVENTS
  public getActiveEvent(): { event: EventItem | null; templateConfig: CertificateConfig } {
    const state = this.getState();
    const active = state.events.find(e => e.status === 'active') || null;
    const templateConfig = active
      ? (state.templateConfigs[active.id] || state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG)
      : (state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG);
    return { event: active, templateConfig };
  }

  public getEventBySlug(slug: string): { event: EventItem | null; templateConfig: CertificateConfig } {
    const state = this.getState();
    const event = state.events.find(e => e.slug === slug || e.id === slug) || null;
    const templateConfig = event
      ? (state.templateConfigs[event.id] || state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG)
      : (state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG);
    return { event, templateConfig };
  }

  public getAllEvents(): EventItem[] {
    const state = this.getState();
    const participantCountMap = new Map<string, number>();
    state.participants.forEach(p => {
      participantCountMap.set(p.eventId, (participantCountMap.get(p.eventId) || 0) + 1);
    });

    return state.events.map(e => ({
      ...e,
      participantCount: participantCountMap.get(e.id) || 0,
    }));
  }

  public createEvent(data: Partial<EventItem>): EventItem {
    const state = this.getState();
    const id = `evt-${Date.now()}`;
    const slug = (data.title || 'kegiatan')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newEvent: EventItem = {
      id,
      title: data.title || 'Kegiatan Baru',
      subtitle: data.subtitle || '',
      description: data.description || '',
      date: data.date || new Date().toLocaleDateString('id-ID'),
      location: data.location || 'Fakultas Sastra Universitas Negeri Malang',
      organizer: data.organizer || 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang',
      certificatePrefix: data.certificatePrefix || 'SERT/DSI/FS-UM/2026/',
      status: data.status || 'inactive',
      slug,
      counter: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newEvent.status === 'active') {
      state.events.forEach(e => { e.status = 'inactive'; });
    }

    state.events.unshift(newEvent);

    // Copy global config as base
    state.templateConfigs[id] = {
      ...(state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG),
      id,
      eventId: id,
      awardText: `Sebagai peserta dalam ${newEvent.title}`,
    };

    this.saveState(state);
    return newEvent;
  }

  public updateEvent(id: string, data: Partial<EventItem>): EventItem {
    const state = this.getState();
    const idx = state.events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Kegiatan tidak ditemukan.');

    if (data.status === 'active') {
      state.events.forEach(e => {
        if (e.id !== id) e.status = 'inactive';
      });
    }

    state.events[idx] = {
      ...state.events[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.saveState(state);
    return state.events[idx];
  }

  public toggleEventStatus(id: string): EventItem {
    const state = this.getState();
    const target = state.events.find(e => e.id === id);
    if (!target) throw new Error('Kegiatan tidak ditemukan.');

    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    if (newStatus === 'active') {
      state.events.forEach(e => { e.status = 'inactive'; });
    }
    target.status = newStatus;
    target.updatedAt = new Date().toISOString();

    this.saveState(state);
    return target;
  }

  public deleteEvent(id: string): void {
    const state = this.getState();
    state.events = state.events.filter(e => e.id !== id);
    state.participants = state.participants.filter(p => p.eventId !== id);
    delete state.templateConfigs[id];
    this.saveState(state);
  }

  // PARTICIPANTS & CERTIFICATES
  public generateCertificate(eventId: string, rawFullName: string): {
    participant: Participant;
    isDuplicate: boolean;
    event: EventItem;
    templateConfig: CertificateConfig;
  } {
    const state = this.getState();
    const event = state.events.find(e => e.id === eventId);
    if (!event) throw new Error('Kegiatan tidak ditemukan.');

    const cleanName = rawFullName.trim().replace(/\s+/g, ' ');

    // Check duplicate (case-insensitive)
    const existing = state.participants.find(
      p => p.eventId === eventId && p.fullName.toLowerCase() === cleanName.toLowerCase()
    );

    const templateConfig = state.templateConfigs[eventId] || state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG;

    if (existing) {
      return {
        participant: existing,
        isDuplicate: true,
        event,
        templateConfig,
      };
    }

    event.counter += 1;
    const certIndex = String(event.counter).padStart(3, '0');
    const certNumber = `${event.certificatePrefix}${certIndex}`;
    const randCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const verificationCode = `VER-${randCode}`;

    const newParticipant: Participant = {
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      fullName: cleanName,
      certificateNumber: certNumber,
      createdAt: new Date().toISOString(),
      verificationCode,
    };

    state.participants.unshift(newParticipant);
    this.saveState(state);

    return {
      participant: newParticipant,
      isDuplicate: false,
      event,
      templateConfig,
    };
  }

  public findParticipantByCertificateNumber(query: string): {
    participant: Participant;
    event: EventItem;
    templateConfig: CertificateConfig;
  } | null {
    const state = this.getState();
    const cleanQuery = decodeURIComponent(query).trim().toLowerCase();

    const participant = state.participants.find(p => {
      const matchNumber = p.certificateNumber.toLowerCase() === cleanQuery;
      const matchVerif = p.verificationCode.toLowerCase() === cleanQuery;
      return matchNumber || matchVerif;
    });

    if (!participant) return null;

    const event = state.events.find(e => e.id === participant.eventId) || {
      id: participant.eventId,
      title: 'Kegiatan Sastra Indonesia UM',
      subtitle: '',
      description: '',
      date: '2026',
      location: 'Universitas Negeri Malang',
      organizer: 'Departemen Sastra Indonesia',
      certificatePrefix: '',
      status: 'inactive',
      slug: '',
      counter: 0,
      createdAt: '',
      updatedAt: '',
    };

    const templateConfig = state.templateConfigs[participant.eventId] || state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG;

    return {
      participant,
      event,
      templateConfig,
    };
  }

  public getAllParticipants(eventId?: string): Participant[] {
    const state = this.getState();
    const eventsMap = new Map(state.events.map(e => [e.id, e]));

    let list = eventId ? state.participants.filter(p => p.eventId === eventId) : state.participants;

    return list.map(p => {
      const ev = eventsMap.get(p.eventId);
      return {
        ...p,
        eventTitle: ev?.title || 'Kegiatan Sastra Indonesia',
        eventDate: ev?.date || '',
      };
    });
  }

  public deleteParticipant(id: string): void {
    const state = this.getState();
    state.participants = state.participants.filter(p => p.id !== id);
    this.saveState(state);
  }

  public regenerateCertificate(participantId: string): Participant {
    const state = this.getState();
    const p = state.participants.find(item => item.id === participantId);
    if (!p) throw new Error('Peserta tidak ditemukan.');

    const event = state.events.find(e => e.id === p.eventId);
    if (event) {
      event.counter += 1;
      const certIndex = String(event.counter).padStart(3, '0');
      p.certificateNumber = `${event.certificatePrefix}${certIndex}`;
      p.verificationCode = `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      p.createdAt = new Date().toISOString();
      this.saveState(state);
    }
    return p;
  }

  // TEMPLATES
  public getTemplateConfig(eventId?: string): CertificateConfig {
    const state = this.getState();
    if (eventId && state.templateConfigs[eventId]) {
      return state.templateConfigs[eventId];
    }
    return state.templateConfigs.global || DEFAULT_GLOBAL_CONFIG;
  }

  public saveTemplateConfig(config: CertificateConfig): CertificateConfig {
    const state = this.getState();
    const key = config.eventId || config.id || 'global';
    state.templateConfigs[key] = { ...config };
    this.saveState(state);
    return state.templateConfigs[key];
  }

  // STATS
  public getStats(): DashboardStats {
    const state = this.getState();
    const totalEvents = state.events.length;
    const activeEvents = state.events.filter(e => e.status === 'active').length;
    const totalCertificates = state.participants.length;

    const todayStr = new Date().toISOString().split('T')[0];
    const certificatesToday = state.participants.filter(p =>
      p.createdAt && p.createdAt.startsWith(todayStr)
    ).length;

    return {
      totalEvents,
      activeEvents,
      totalCertificates,
      certificatesToday,
    };
  }

  // EXPORT CSV
  public generateCsv(eventId?: string): string {
    const participants = this.getAllParticipants(eventId);
    const eventsMap = new Map(this.getState().events.map(e => [e.id, e]));

    let csv = '\uFEFFNo,Nama Lengkap,Nomor Sertifikat,Nama Kegiatan,Tanggal Dibuat,Kode Verifikasi\n';
    participants.forEach((p, idx) => {
      const event = eventsMap.get(p.eventId);
      const safeName = `"${p.fullName.replace(/"/g, '""')}"`;
      const safeNumber = `"${p.certificateNumber.replace(/"/g, '""')}"`;
      const safeEvent = `"${(event?.title || '-').replace(/"/g, '""')}"`;
      const dateStr = new Date(p.createdAt).toLocaleString('id-ID');
      const safeDate = `"${dateStr}"`;
      const safeVerif = `"${p.verificationCode || '-'}"`;
      csv += `${idx + 1},${safeName},${safeNumber},${safeEvent},${safeDate},${safeVerif}\n`;
    });
    return csv;
  }
}

export const localDb = new LocalDatabase();
