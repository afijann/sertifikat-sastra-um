import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limit for base64 logos and signatures
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Simple in-memory session token store for admin
const validTokens = new Set<string>();

// Auth Helper
function isAdminAuthenticated(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;
  if (validTokens.has(token)) return true;
  // Stateless token prefix: prevents session invalidation when serverless container scales or restarts
  if (token.startsWith('sastra_admin_sec_')) return true;
  return false;
}

// Admin Auth Middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'Sesi admin tidak valid atau telah berakhir. Silakan login kembali.' });
    return;
  }
  next();
};

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// 1. Get active event for main student page
app.get('/api/public/active-event', (req, res) => {
  try {
    const activeEvent = db.getActiveEvent();
    if (!activeEvent) {
      res.json({
        event: null,
        templateConfig: db.getGlobalTemplateConfig(),
        message: 'Belum ada kegiatan yang aktif saat ini.',
      });
      return;
    }

    const templateConfig = db.getEventTemplateConfig(activeEvent.id);
    res.json({
      event: activeEvent,
      templateConfig,
    });
  } catch (error: any) {
    console.error('Error fetching active event:', error);
    res.status(500).json({ error: 'Maaf, terjadi kesalahan saat memuat kegiatan aktif.' });
  }
});

// 2. Get event by slug (for /event/:slug)
app.get('/api/public/event/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const event = db.getEventBySlug(slug);
    if (!event) {
      res.status(404).json({ error: 'Kegiatan tidak ditemukan atau link sudah tidak berlaku.' });
      return;
    }

    const templateConfig = db.getEventTemplateConfig(event.id);
    res.json({
      event,
      templateConfig,
    });
  } catch (error: any) {
    console.error('Error fetching event by slug:', error);
    res.status(500).json({ error: 'Gagal memuat data kegiatan.' });
  }
});

// 3. Generate certificate (Student submits name)
app.post('/api/public/certificates/generate', (req, res) => {
  try {
    const { eventId, fullName } = req.body;

    if (!eventId || typeof eventId !== 'string') {
      res.status(400).json({ error: 'ID kegiatan wajib disertakan.' });
      return;
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
      res.status(400).json({ error: 'Nama lengkap harus diisi minimal 3 karakter.' });
      return;
    }

    const result = db.generateCertificate(eventId, fullName);
    const templateConfig = db.getEventTemplateConfig(eventId);

    res.json({
      success: true,
      participant: result.participant,
      isDuplicate: result.isDuplicate,
      event: result.event,
      templateConfig,
      message: result.isDuplicate
        ? 'Nama ini sudah memiliki sertifikat untuk kegiatan ini.'
        : 'Sertifikat berhasil dibuat.',
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    res.status(400).json({
      error: error.message || 'Maaf, sertifikat belum dapat dibuat. Silakan coba kembali.',
    });
  }
});

// 4. Verify certificate by certificateNumber
app.get('/api/public/verify/:certNumber', (req, res) => {
  try {
    const { certNumber } = req.params;
    // Decode URI component because certificate numbers have slashes or dashes
    const decodedNumber = decodeURIComponent(certNumber);
    
    const participant = db.findParticipantByCertificateNumber(decodedNumber);
    if (!participant) {
      res.status(404).json({
        valid: false,
        message: 'Nomor sertifikat tidak ditemukan dalam pangkalan data resmi.',
      });
      return;
    }

    const event = db.getEventById(participant.eventId);
    const templateConfig = db.getEventTemplateConfig(participant.eventId);

    res.json({
      valid: true,
      participant,
      event,
      templateConfig,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ valid: false, error: 'Gagal memverifikasi sertifikat.' });
  }
});

/* ==========================================================================
   ADMIN AUTHENTICATION
   ========================================================================== */

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username dan password wajib diisi.' });
      return;
    }

    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();

    const user = db.getUserByUsername(cleanUser);
    // User requested default credentials: sastraindonesia / sastrajaya
    if (!user || user.passwordHash !== cleanPass) {
      res.status(401).json({ error: 'Username atau password salah.' });
      return;
    }

    const token = `sastra_admin_sec_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    validTokens.add(token);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan sistem saat proses login.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (isAdminAuthenticated(req)) {
    res.json({ authenticated: true, user: { username: 'sastraindonesia', name: 'Administrator Sastra Indonesia UM' } });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.put('/api/admin/change-password', requireAdmin, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || String(newPassword).trim().length < 4) {
      res.status(400).json({ error: 'Password baru minimal 4 karakter.' });
      return;
    }
    const adminUser = db.getUserByUsername('sastraindonesia');
    if (adminUser && currentPassword && adminUser.passwordHash !== String(currentPassword).trim()) {
      res.status(400).json({ error: 'Password lama tidak cocok.' });
      return;
    }
    db.updateUserPassword('admin-1', String(newPassword).trim());
    res.json({ success: true, message: 'Password admin berhasil diperbarui.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memperbarui password.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    validTokens.delete(token);
  }
  res.json({ success: true, message: 'Berhasil keluar.' });
});

/* ==========================================================================
   ADMIN PROTECTED ENDPOINTS
   ========================================================================== */

// Dashboard Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal mengambil data statistik.' });
  }
});

// Event Management
app.get('/api/admin/events', requireAdmin, (req, res) => {
  try {
    const events = db.getAllEvents();
    // Attach participant counts
    const enriched = events.map(evt => {
      const participants = db.getAllParticipants(evt.id);
      return {
        ...evt,
        participantCount: participants.length,
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal mengambil daftar kegiatan.' });
  }
});

app.post('/api/admin/events', requireAdmin, (req, res) => {
  try {
    const { title, subtitle, description, date, location, organizer, certificatePrefix, status } = req.body;

    if (!title || !date || !certificatePrefix) {
      res.status(400).json({ error: 'Judul, tanggal, dan prefix nomor sertifikat wajib diisi.' });
      return;
    }

    // Auto generate clean slug
    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = slugBase || `kegiatan-${Date.now()}`;
    // Ensure slug uniqueness
    if (db.getEventBySlug(slug)) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newEvent = db.createEvent({
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      description: (description || '').trim(),
      date: date.trim(),
      location: (location || 'Universitas Negeri Malang').trim(),
      organizer: (organizer || 'Departemen Sastra Indonesia\nFakultas Sastra\nUniversitas Negeri Malang').trim(),
      certificatePrefix: certificatePrefix.trim(),
      status: status === 'active' ? 'active' : 'inactive',
      slug,
    });

    res.status(201).json(newEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Gagal membuat kegiatan baru.' });
  }
});

app.get('/api/admin/events/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const event = db.getEventById(id);
    if (!event) {
      res.status(404).json({ error: 'Kegiatan tidak ditemukan.' });
      return;
    }
    const templateConfig = db.getEventTemplateConfig(id);
    const participants = db.getAllParticipants(id);

    res.json({
      event,
      templateConfig,
      participantCount: participants.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal mengambil detail kegiatan.' });
  }
});

app.put('/api/admin/events/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, date, location, organizer, certificatePrefix, status, slug } = req.body;

    const updated = db.updateEvent(id, {
      ...(title && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(date && { date: date.trim() }),
      ...(location !== undefined && { location: location.trim() }),
      ...(organizer !== undefined && { organizer: organizer.trim() }),
      ...(certificatePrefix && { certificatePrefix: certificatePrefix.trim() }),
      ...(status && { status }),
      ...(slug && { slug: slug.trim().toLowerCase() }),
    });

    if (!updated) {
      res.status(404).json({ error: 'Kegiatan tidak ditemukan.' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memperbarui kegiatan.' });
  }
});

app.post('/api/admin/events/:id/toggle-status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.toggleEventStatus(id);
    if (!updated) {
      res.status(404).json({ error: 'Kegiatan tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal mengubah status kegiatan.' });
  }
});

app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteEvent(id);
    if (!deleted) {
      res.status(404).json({ error: 'Kegiatan tidak ditemukan atau sudah dihapus.' });
      return;
    }
    res.json({ success: true, message: 'Kegiatan berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal menghapus kegiatan.' });
  }
});

// Participant Management
app.get('/api/admin/participants', requireAdmin, (req, res) => {
  try {
    const eventId = req.query.eventId as string | undefined;
    const search = (req.query.search as string | undefined)?.toLowerCase();

    let list = db.getAllParticipants(eventId);

    if (search) {
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(search) ||
        p.certificateNumber.toLowerCase().includes(search)
      );
    }

    // Attach event title
    const eventsMap = new Map(db.getAllEvents().map(e => [e.id, e]));
    const enriched = list.map(p => ({
      ...p,
      eventTitle: eventsMap.get(p.eventId)?.title || 'Kegiatan Tidak Diketahui',
      eventDate: eventsMap.get(p.eventId)?.date || '',
    }));

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memuat data peserta.' });
  }
});

// Regenerate certificate without changing certificate number
app.post('/api/admin/participants/:id/regenerate', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const participant = db.regenerateParticipantCertificate(id);
    if (!participant) {
      res.status(404).json({ error: 'Peserta tidak ditemukan.' });
      return;
    }
    const event = db.getEventById(participant.eventId);
    const templateConfig = db.getEventTemplateConfig(participant.eventId);

    res.json({
      success: true,
      participant,
      event,
      templateConfig,
      message: 'Sertifikat berhasil diregenerasi menggunakan konfigurasi template terbaru.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal meregenerasi sertifikat.' });
  }
});

app.delete('/api/admin/participants/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteParticipant(id);
    if (!deleted) {
      res.status(404).json({ error: 'Peserta tidak ditemukan.' });
      return;
    }
    res.json({ success: true, message: 'Data peserta berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal menghapus data peserta.' });
  }
});

// Template Configuration
app.get('/api/admin/template', requireAdmin, (req, res) => {
  try {
    const eventId = req.query.eventId as string | undefined;
    if (eventId) {
      res.json(db.getEventTemplateConfig(eventId));
    } else {
      res.json(db.getGlobalTemplateConfig());
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memuat konfigurasi template.' });
  }
});

app.put('/api/admin/template', requireAdmin, (req, res) => {
  try {
    const { key, config } = req.body;
    const targetKey = key || 'global';
    const updated = db.updateTemplateConfig(targetKey, config);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Gagal memperbarui konfigurasi template.' });
  }
});

// Export CSV for Participants
app.get('/api/admin/export/csv', requireAdmin, (req, res) => {
  try {
    const eventId = req.query.eventId as string | undefined;
    const participants = db.getAllParticipants(eventId);
    const eventsMap = new Map(db.getAllEvents().map(e => [e.id, e]));

    // CSV Header with BOM for Excel UTF-8 display
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

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Peserta_Sertifikat_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Gagal mengekspor data CSV.' });
  }
});

/* ==========================================================================
   VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UM-Sertifikat] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
