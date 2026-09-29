import fs from 'fs';
import path from 'path';
import {
  DEFAULT_UM_LOGO,
  DEFAULT_FS_LOGO,
  DEFAULT_DSI_LOGO,
  DEFAULT_SIGNATURE,
  DEFAULT_STAMP,
  DEFAULT_SIGNER_NAME,
  DEFAULT_SIGNER_POSITION,
  DEFAULT_SIGNER_NIP,
} from './defaultLogos.ts';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin';
  name: string;
}

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  certificatePrefix: string;
  status: 'active' | 'inactive';
  slug: string;
  counter: number;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  eventId: string;
  fullName: string;
  certificateNumber: string;
  createdAt: string;
  verificationCode: string;
}

export interface CertificateConfig {
  id: string;
  eventId?: string; // If null/empty, serves as global default
  eventName?: string;
  eventSubtitle?: string;
  eventDate?: string;
  eventLocation?: string;
  eventOrganizer?: string;
  certificateTitle: string; // e.g. "SERTIFIKAT"
  recipientPrefix: string; // e.g. "Diberikan kepada:"
  awardText: string; // e.g. "Sebagai peserta dalam kegiatan"
  signerName: string; // e.g. "Dr. Moch. Syahri, S.Sos., M.Si."
  signerPosition: string; // e.g. "Ketua Departemen Sastra Indonesia"
  signerNip?: string; // e.g. "NIP 197105282001121001"
  primaryColor: string; // e.g. "#6B1724" (Maroon)
  secondaryColor: string; // e.g. "#C5A059" (Gold)
  logoUm?: string; // Base64 or URL
  logoFs?: string; // Base64 or URL
  logoDsi?: string; // Base64 or URL
  signatureImage?: string; // Base64 or URL
  stampImage?: string; // Base64 or URL
  universityName: string;
  facultyName: string;
  departmentName: string;
  fontSizeTitle: number; // pt/px ratio
  fontSizeName: number;
  fontSizeBody: number;
  frameStyle: 'classic-double' | 'ornament-gold' | 'minimal-modern';
  showQr: boolean;
  signatureSize?: number;
  stampSize?: number;
  logoSize?: number;
  showLogos?: boolean;
  showLogoUm?: boolean;
  showLogoFs?: boolean;
  showLogoDsi?: boolean;
  hideLogoPlaceholders?: boolean;
}

export interface DatabaseSchema {
  users: User[];
  events: EventItem[];
  participants: Participant[];
  templateConfigs: Record<string, CertificateConfig>; // key: eventId or 'global'
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const DEFAULT_GLOBAL_CONFIG: CertificateConfig = {
  id: 'global',
  certificateTitle: 'SERTIFIKAT',
  recipientPrefix: 'Diberikan kepada:',
  awardText: 'Sebagai peserta dalam kegiatan',
  signerName: DEFAULT_SIGNER_NAME,
  signerPosition: DEFAULT_SIGNER_POSITION,
  signerNip: DEFAULT_SIGNER_NIP,
  primaryColor: '#6B1724',
  secondaryColor: '#C5A059',
  logoUm: DEFAULT_UM_LOGO,
  logoFs: DEFAULT_FS_LOGO,
  logoDsi: DEFAULT_DSI_LOGO,
  signatureImage: DEFAULT_SIGNATURE,
  stampImage: DEFAULT_STAMP,
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
  logoSize: 70,
  showLogos: true,
  showLogoUm: true,
  showLogoFs: true,
  showLogoDsi: true,
  hideLogoPlaceholders: false,
};

const DEFAULT_DATA: DatabaseSchema = {
  users: [
    {
      id: 'admin-1',
      username: 'sastraindonesia',
      passwordHash: 'kucing10',
      role: 'admin',
      name: 'Administrator Sastra Indonesia UM',
    },
  ],
  events: [
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
  ],
  participants: [
    {
      id: 'part-1',
      eventId: 'evt-ws-pkm-2026',
      fullName: 'Siti Rahmawati',
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
  ],
  templateConfigs: {
    global: DEFAULT_GLOBAL_CONFIG,
    'evt-ws-pkm-2026': {
      ...DEFAULT_GLOBAL_CONFIG,
      id: 'evt-ws-pkm-2026',
      eventId: 'evt-ws-pkm-2026',
      awardText: 'Sebagai peserta dalam kegiatan',
    },
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
        return DEFAULT_DATA;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Validate structure
      if (!parsed.events || !parsed.users || !parsed.participants) {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
        return DEFAULT_DATA;
      }

      // Guarantee admin user has passwordHash: 'kucing10'
      for (const u of parsed.users) {
        if (u.role === 'admin') {
          u.passwordHash = 'kucing10';
        }
      }

      // Guarantee template configs have official patented logos, signatures, and stamps
      if (!parsed.templateConfigs) {
        parsed.templateConfigs = { global: { ...DEFAULT_GLOBAL_CONFIG } };
      }

      const sanitizeConfig = (cfg: CertificateConfig): CertificateConfig => {
        const out = { ...cfg };
        if (!out.logoUm || (typeof out.logoUm === 'string' && out.logoUm.length > 500000 && !out.logoUm.startsWith('data:image/png') && !out.logoUm.startsWith('data:image/svg'))) {
          out.logoUm = DEFAULT_UM_LOGO;
        }
        if (!out.logoFs) out.logoFs = DEFAULT_FS_LOGO;
        if (!out.logoDsi) out.logoDsi = DEFAULT_DSI_LOGO;
        if (!out.signatureImage) out.signatureImage = DEFAULT_SIGNATURE;
        if (!out.stampImage) out.stampImage = DEFAULT_STAMP;
        if (!out.signerName || out.signerName.includes('Syahri') || out.signerName === 'Azizah') {
          out.signerName = DEFAULT_SIGNER_NAME;
        }
        if (!out.signerPosition) out.signerPosition = DEFAULT_SIGNER_POSITION;
        if (!out.signerNip || out.signerNip.includes('197105282001121001')) {
          out.signerNip = DEFAULT_SIGNER_NIP;
        }
        return out;
      };

      if (parsed.templateConfigs.global) {
        parsed.templateConfigs.global = sanitizeConfig(parsed.templateConfigs.global);
      } else {
        parsed.templateConfigs.global = { ...DEFAULT_GLOBAL_CONFIG };
      }

      for (const k of Object.keys(parsed.templateConfigs)) {
        parsed.templateConfigs[k] = sanitizeConfig(parsed.templateConfigs[k]);
      }

      return parsed;
    } catch (err) {
      console.error('Error loading database, using default data:', err);
      return DEFAULT_DATA;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // Auth
  getUserByUsername(username: string): User | undefined {
    const clean = (username || '').trim().toLowerCase();
    return this.data.users.find(u => {
      const uName = (u.username || '').toLowerCase();
      return (
        uName === clean ||
        (clean === 'admin' && u.role === 'admin') ||
        (clean === 'afiyanti.fs@um.ac.id' && u.role === 'admin') ||
        (clean === 'sastra' && u.role === 'admin')
      );
    });
  }

  updateUserPassword(userId: string, newPasswordPlain: string): boolean {
    const user = this.data.users.find(u => u.id === userId || u.role === 'admin');
    if (!user) return false;
    user.passwordHash = newPasswordPlain.trim();
    this.save();
    return true;
  }

  // Events
  getAllEvents(): EventItem[] {
    return this.data.events;
  }

  getEventById(id: string): EventItem | undefined {
    return this.data.events.find(e => e.id === id);
  }

  getEventBySlug(slug: string): EventItem | undefined {
    return this.data.events.find(e => e.slug.toLowerCase() === slug.toLowerCase());
  }

  getActiveEvent(): EventItem | undefined {
    // Prefer first active event
    return this.data.events.find(e => e.status === 'active');
  }

  createEvent(eventData: Omit<EventItem, 'id' | 'counter' | 'createdAt' | 'updatedAt'>): EventItem {
    const newId = `evt-${Date.now()}`;
    // If set to active, optionally we can keep multiple or single active
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      counter: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.events.unshift(newEvent);

    // Initialize template config for this event copied from global
    const globalConfig = this.getGlobalTemplateConfig();
    this.data.templateConfigs[newId] = {
      ...globalConfig,
      id: newId,
      eventId: newId,
    };

    this.save();
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<EventItem>): EventItem | null {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.events[idx] = {
      ...this.data.events[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Propagate event identity updates to templateConfigs
    if (this.data.templateConfigs[id]) {
      if (updates.title) this.data.templateConfigs[id].eventName = updates.title;
      if (updates.subtitle !== undefined) this.data.templateConfigs[id].eventSubtitle = updates.subtitle;
      if (updates.date) this.data.templateConfigs[id].eventDate = updates.date;
      if (updates.location !== undefined) this.data.templateConfigs[id].eventLocation = updates.location;
      if (updates.organizer !== undefined) this.data.templateConfigs[id].eventOrganizer = updates.organizer;
    }
    if (this.data.events[idx].status === 'active' && this.data.templateConfigs['global']) {
      if (updates.title) this.data.templateConfigs['global'].eventName = updates.title;
      if (updates.subtitle !== undefined) this.data.templateConfigs['global'].eventSubtitle = updates.subtitle;
      if (updates.date) this.data.templateConfigs['global'].eventDate = updates.date;
      if (updates.location !== undefined) this.data.templateConfigs['global'].eventLocation = updates.location;
      if (updates.organizer !== undefined) this.data.templateConfigs['global'].eventOrganizer = updates.organizer;
    }

    this.save();
    return this.data.events[idx];
  }

  deleteEvent(id: string): boolean {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.id !== id);
    // Also remove participants and template config
    this.data.participants = this.data.participants.filter(p => p.eventId !== id);
    delete this.data.templateConfigs[id];
    this.save();
    return this.data.events.length < initialLen;
  }

  toggleEventStatus(id: string, status?: 'active' | 'inactive'): EventItem | null {
    const event = this.getEventById(id);
    if (!event) return null;
    const nextStatus = status ? status : (event.status === 'active' ? 'inactive' : 'active');
    
    // If activating, user might want this as active
    return this.updateEvent(id, { status: nextStatus });
  }

  // Participants & Certificates
  getAllParticipants(eventId?: string): Participant[] {
    if (eventId) {
      return this.data.participants.filter(p => p.eventId === eventId);
    }
    return this.data.participants;
  }

  getParticipantById(id: string): Participant | undefined {
    return this.data.participants.find(p => p.id === id);
  }

  findParticipantByExactNameAndEvent(fullName: string, eventId: string): Participant | undefined {
    const cleanSearchName = fullName.trim().replace(/\s+/g, ' ').toLowerCase();
    return this.data.participants.find(
      p => p.eventId === eventId && p.fullName.trim().replace(/\s+/g, ' ').toLowerCase() === cleanSearchName
    );
  }

  findParticipantByCertificateNumber(certNumber: string): Participant | undefined {
    const cleanNumber = certNumber.trim().replace(/\s+/g, '').toLowerCase();
    return this.data.participants.find(
      p => p.certificateNumber.trim().replace(/\s+/g, '').toLowerCase() === cleanNumber
    );
  }

  generateCertificate(eventId: string, rawFullName: string): { participant: Participant; isDuplicate: boolean; event: EventItem } {
    const event = this.getEventById(eventId);
    if (!event) {
      throw new Error('Kegiatan tidak ditemukan');
    }

    // Clean name: trim whitespace, normalize multiple spaces, keep casing
    const cleanedName = rawFullName.trim().replace(/\s+/g, ' ');
    if (cleanedName.length < 3) {
      throw new Error('Nama lengkap minimal 3 karakter');
    }

    // Check duplicate
    const existing = this.findParticipantByExactNameAndEvent(cleanedName, eventId);
    if (existing) {
      return { participant: existing, isDuplicate: true, event };
    }

    // Increment event counter
    event.counter = (event.counter || 0) + 1;
    const paddedCounter = String(event.counter).padStart(3, '0');
    
    // Build certificate number
    const prefix = event.certificatePrefix.endsWith('/') || event.certificatePrefix.endsWith('-')
      ? event.certificatePrefix
      : `${event.certificatePrefix}/`;
    const certificateNumber = `${prefix}${paddedCounter}`;

    const newParticipant: Participant = {
      id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventId,
      fullName: cleanedName,
      certificateNumber,
      createdAt: new Date().toISOString(),
      verificationCode: `VER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    this.data.participants.unshift(newParticipant);
    this.updateEvent(eventId, { counter: event.counter });
    this.save();

    return { participant: newParticipant, isDuplicate: false, event };
  }

  regenerateParticipantCertificate(participantId: string): Participant | null {
    const participant = this.getParticipantById(participantId);
    if (!participant) return null;
    // Keep exact same certificateNumber!
    this.save();
    return participant;
  }

  deleteParticipant(id: string): boolean {
    const initialLen = this.data.participants.length;
    this.data.participants = this.data.participants.filter(p => p.id !== id);
    this.save();
    return this.data.participants.length < initialLen;
  }

  // Template Config
  getGlobalTemplateConfig(): CertificateConfig {
    return this.data.templateConfigs['global'] || DEFAULT_GLOBAL_CONFIG;
  }

  getEventTemplateConfig(eventId: string): CertificateConfig {
    const globalCfg = this.getGlobalTemplateConfig();
    const eventCfg = this.data.templateConfigs[eventId];
    const evt = this.getEventById(eventId);
    const baseEvtName = evt?.title || globalCfg.eventName;
    const baseEvtSubtitle = evt?.subtitle !== undefined ? evt.subtitle : globalCfg.eventSubtitle;
    const baseEvtDate = evt?.date || globalCfg.eventDate;
    const baseEvtLoc = evt?.location || globalCfg.eventLocation;
    const baseEvtOrg = evt?.organizer || globalCfg.eventOrganizer;

    if (eventCfg) {
      return {
        ...globalCfg,
        ...eventCfg,
        eventName: eventCfg.eventName || baseEvtName,
        eventSubtitle: eventCfg.eventSubtitle !== undefined ? eventCfg.eventSubtitle : baseEvtSubtitle,
        eventDate: eventCfg.eventDate || baseEvtDate,
        eventLocation: eventCfg.eventLocation || baseEvtLoc,
        eventOrganizer: eventCfg.eventOrganizer || baseEvtOrg,
        signerName: eventCfg.signerName || globalCfg.signerName || DEFAULT_SIGNER_NAME,
        signerPosition: eventCfg.signerPosition || globalCfg.signerPosition || DEFAULT_SIGNER_POSITION,
        signerNip: eventCfg.signerNip || globalCfg.signerNip || DEFAULT_SIGNER_NIP,
        logoUm: eventCfg.logoUm || globalCfg.logoUm || DEFAULT_UM_LOGO,
        logoFs: eventCfg.logoFs || globalCfg.logoFs || DEFAULT_FS_LOGO,
        logoDsi: eventCfg.logoDsi || globalCfg.logoDsi || DEFAULT_DSI_LOGO,
        signatureImage: eventCfg.signatureImage || globalCfg.signatureImage || DEFAULT_SIGNATURE,
        stampImage: eventCfg.stampImage || globalCfg.stampImage || DEFAULT_STAMP,
        logoSize: eventCfg.logoSize || globalCfg.logoSize || 70,
        signatureSize: eventCfg.signatureSize || globalCfg.signatureSize || 70,
        stampSize: eventCfg.stampSize || globalCfg.stampSize || 75,
        id: eventId,
        eventId,
      };
    }
    return {
      ...globalCfg,
      eventName: baseEvtName,
      eventSubtitle: baseEvtSubtitle,
      eventDate: baseEvtDate,
      eventLocation: baseEvtLoc,
      eventOrganizer: baseEvtOrg,
      signerName: globalCfg.signerName || DEFAULT_SIGNER_NAME,
      signerPosition: globalCfg.signerPosition || DEFAULT_SIGNER_POSITION,
      signerNip: globalCfg.signerNip || DEFAULT_SIGNER_NIP,
      signatureImage: globalCfg.signatureImage || DEFAULT_SIGNATURE,
      stampImage: globalCfg.stampImage || DEFAULT_STAMP,
      logoUm: globalCfg.logoUm || DEFAULT_UM_LOGO,
      logoFs: globalCfg.logoFs || DEFAULT_FS_LOGO,
      logoDsi: globalCfg.logoDsi || DEFAULT_DSI_LOGO,
      id: eventId,
      eventId,
    };
  }

  updateTemplateConfig(key: string, updates: Partial<CertificateConfig>, applyToAll: boolean = true): CertificateConfig {
    const current = this.data.templateConfigs[key] || (key === 'global' ? DEFAULT_GLOBAL_CONFIG : this.getGlobalTemplateConfig());
    const updated: CertificateConfig = {
      ...current,
      ...updates,
      id: key,
    };
    this.data.templateConfigs[key] = updated;

    // Sync event entity if eventName / eventDate / eventLocation are supplied
    const eventFieldUpdates: Partial<EventItem> = {};
    if (updates.eventName && updates.eventName.trim()) eventFieldUpdates.title = updates.eventName.trim();
    if (updates.eventSubtitle !== undefined) eventFieldUpdates.subtitle = updates.eventSubtitle.trim();
    if (updates.eventDate && updates.eventDate.trim()) eventFieldUpdates.date = updates.eventDate.trim();
    if (updates.eventLocation !== undefined) eventFieldUpdates.location = updates.eventLocation.trim();
    if (updates.eventOrganizer !== undefined) eventFieldUpdates.organizer = updates.eventOrganizer.trim();

    if (key !== 'global' && Object.keys(eventFieldUpdates).length > 0) {
      this.updateEvent(key, eventFieldUpdates);
    } else if (key === 'global' && Object.keys(eventFieldUpdates).length > 0) {
      const activeEvt = this.getActiveEvent();
      if (activeEvt) {
        this.updateEvent(activeEvt.id, eventFieldUpdates);
      }
    }

    // If saving global or applyToAll is requested, propagate visual & institutional designs to all event configs
    if (key === 'global' || applyToAll) {
      this.data.templateConfigs['global'] = {
        ...this.getGlobalTemplateConfig(),
        ...updates,
        id: 'global',
      };

      // Propagate to all events
      for (const evt of this.data.events) {
        this.data.templateConfigs[evt.id] = {
          ...(this.data.templateConfigs[evt.id] || {}),
          ...updates,
          id: evt.id,
          eventId: evt.id,
        };
      }

      for (const evId of Object.keys(this.data.templateConfigs)) {
        if (evId !== 'global') {
          this.data.templateConfigs[evId] = {
            ...this.data.templateConfigs[evId],
            ...updates,
            id: evId,
            eventId: evId,
          };
        }
      }
    }

    this.save();
    return updated;
  }

  // Statistics
  getStats() {
    const totalEvents = this.data.events.length;
    const activeEvents = this.data.events.filter(e => e.status === 'active').length;
    const totalCertificates = this.data.participants.length;
    
    // Today's certificates
    const today = new Date().toISOString().slice(0, 10);
    const certificatesToday = this.data.participants.filter(p => p.createdAt.startsWith(today)).length;

    return {
      totalEvents,
      activeEvents,
      totalCertificates,
      certificatesToday,
    };
  }
}

export const db = new Database();
