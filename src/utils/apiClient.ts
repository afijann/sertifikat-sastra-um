import { EventItem, Participant, CertificateConfig, DashboardStats, AdminUser } from '../types';
import { localDb } from './localDatabase';

/**
 * Safe API Client with automatic fallback to client-side storage engine
 * Prevents "Unexpected token '<', <!DOCTYPE... is not valid JSON" errors
 * when deployed on static preview or serverless edge containers.
 */

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    
    // If response is not JSON (e.g. HTML 404, 502, or SPA index.html fallback starting with <!DOCTYPE)
    if (!contentType.includes('application/json')) {
      return { success: false, status: res.status, error: 'NON_JSON_RESPONSE' };
    }

    const json = await res.json();
    if (!res.ok) {
      return { success: false, status: res.status, error: json.error || 'Server error', data: json };
    }

    return { success: true, status: res.status, data: json };
  } catch (err: any) {
    return { success: false, error: err.message || 'NETWORK_ERROR' };
  }
}

export const apiClient = {
  // AUTH LOGIN
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // Try server first
    const res = await safeFetchJson<{ success: boolean; token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass }),
    });

    if (res.success && res.data?.token) {
      return { token: res.data.token, user: res.data.user };
    }

    // If server gave explicit 401 with valid JSON error message
    if (res.status === 401 && res.error && res.error !== 'NON_JSON_RESPONSE') {
      // Check if localDb accepts it before rejecting
      const localRes = localDb.login(cleanUser, cleanPass);
      if (localRes.success && localRes.token && localRes.user) {
        return { token: localRes.token, user: localRes.user };
      }
      throw new Error(res.error || 'Username atau password salah.');
    }

    // Fallback to local database
    const localRes = localDb.login(cleanUser, cleanPass);
    if (!localRes.success || !localRes.token || !localRes.user) {
      throw new Error(localRes.error || 'Username atau password tidak cocok.');
    }

    return { token: localRes.token, user: localRes.user };
  },

  // CHANGE PASSWORD
  async changePassword(adminToken: string, currentPassword: string, newPassword: string): Promise<void> {
    const res = await safeFetchJson<{ success: boolean }>('/api/admin/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    // Always record to localDb
    const localRes = localDb.changePassword(currentPassword, newPassword);
    if (!res.success && !localRes.success) {
      throw new Error(res.error || localRes.error || 'Gagal memperbarui kata sandi.');
    }
  },

  // PUBLIC: GET ACTIVE EVENT
  async getActiveEvent(): Promise<{ event: EventItem | null; templateConfig: CertificateConfig; message?: string }> {
    const res = await safeFetchJson<{ event: EventItem | null; templateConfig: CertificateConfig; message?: string }>('/api/public/active-event');
    if (res.success && res.data) {
      return res.data;
    }
    return localDb.getActiveEvent();
  },

  // PUBLIC: GET EVENT BY SLUG
  async getEventBySlug(slug: string): Promise<{ event: EventItem | null; templateConfig: CertificateConfig; message?: string }> {
    const res = await safeFetchJson<{ event: EventItem | null; templateConfig: CertificateConfig; message?: string }>(`/api/public/event/${slug}`);
    if (res.success && res.data) {
      return res.data;
    }
    return localDb.getEventBySlug(slug);
  },

  // PUBLIC: GENERATE CERTIFICATE
  async generateCertificate(eventId: string, fullName: string): Promise<{
    participant: Participant;
    isDuplicate: boolean;
    event: EventItem;
    templateConfig: CertificateConfig;
    message?: string;
  }> {
    const res = await safeFetchJson<{
      success: boolean;
      participant: Participant;
      isDuplicate: boolean;
      event: EventItem;
      templateConfig: CertificateConfig;
      message?: string;
    }>('/api/public/certificates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, fullName }),
    });

    if (res.success && res.data?.participant) {
      return res.data;
    }

    // Fallback: localDb
    return localDb.generateCertificate(eventId, fullName);
  },

  // PUBLIC: VERIFY CERTIFICATE
  async verifyCertificate(certNumber: string): Promise<{
    valid: boolean;
    participant?: Participant;
    event?: EventItem;
    templateConfig?: CertificateConfig;
    verifiedAt?: string;
    message?: string;
  }> {
    const encoded = encodeURIComponent(certNumber);
    const res = await safeFetchJson<{
      valid: boolean;
      participant: Participant;
      event: EventItem;
      templateConfig: CertificateConfig;
      verifiedAt: string;
      message?: string;
    }>(`/api/public/verify/${encoded}`);

    if (res.success && res.data) {
      return res.data;
    }

    const localFound = localDb.findParticipantByCertificateNumber(certNumber);
    if (localFound) {
      return {
        valid: true,
        participant: localFound.participant,
        event: localFound.event,
        templateConfig: localFound.templateConfig,
        verifiedAt: new Date().toISOString(),
      };
    }

    return {
      valid: false,
      message: 'Nomor sertifikat tidak ditemukan dalam pangkalan data resmi.',
    };
  },

  // ADMIN: STATS
  async getDashboardStats(adminToken: string): Promise<DashboardStats> {
    const res = await safeFetchJson<DashboardStats>('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.success && res.data) {
      return res.data;
    }
    return localDb.getStats();
  },

  // ADMIN: GET ALL EVENTS
  async getAllEvents(adminToken: string): Promise<EventItem[]> {
    const res = await safeFetchJson<{ events: EventItem[] }>('/api/admin/events', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.success && res.data?.events) {
      return res.data.events;
    }
    return localDb.getAllEvents();
  },

  // ADMIN: CREATE EVENT
  async createEvent(adminToken: string, data: Partial<EventItem>): Promise<EventItem> {
    const res = await safeFetchJson<{ event: EventItem }>('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });

    const localEvent = localDb.createEvent(data);
    if (res.success && res.data?.event) {
      return res.data.event;
    }
    return localEvent;
  },

  // ADMIN: UPDATE EVENT
  async updateEvent(adminToken: string, id: string, data: Partial<EventItem>): Promise<EventItem> {
    const res = await safeFetchJson<{ event: EventItem }>(`/api/admin/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(data),
    });

    const localUpdated = localDb.updateEvent(id, data);
    if (res.success && res.data?.event) {
      return res.data.event;
    }
    return localUpdated;
  },

  // ADMIN: TOGGLE EVENT STATUS
  async toggleEventStatus(adminToken: string, id: string): Promise<EventItem> {
    const res = await safeFetchJson<{ event: EventItem }>(`/api/admin/events/${id}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const localToggled = localDb.toggleEventStatus(id);
    if (res.success && res.data?.event) {
      return res.data.event;
    }
    return localToggled;
  },

  // ADMIN: DELETE EVENT
  async deleteEvent(adminToken: string, id: string): Promise<void> {
    await safeFetchJson(`/api/admin/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    localDb.deleteEvent(id);
  },

  // ADMIN: GET PARTICIPANTS
  async getParticipants(adminToken: string, eventId?: string): Promise<Participant[]> {
    const query = eventId ? `?eventId=${eventId}` : '';
    const res = await safeFetchJson<{ participants: Participant[] }>(`/api/admin/participants${query}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.success && res.data?.participants) {
      return res.data.participants;
    }
    return localDb.getAllParticipants(eventId);
  },

  // ADMIN: DELETE PARTICIPANT
  async deleteParticipant(adminToken: string, id: string): Promise<void> {
    await safeFetchJson(`/api/admin/participants/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    localDb.deleteParticipant(id);
  },

  // ADMIN: REGENERATE CERTIFICATE
  async regenerateCertificate(adminToken: string, participantId: string): Promise<Participant> {
    const res = await safeFetchJson<{ participant: Participant }>(`/api/admin/participants/${participantId}/regenerate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const localRegen = localDb.regenerateCertificate(participantId);
    if (res.success && res.data?.participant) {
      return res.data.participant;
    }
    return localRegen;
  },

  // ADMIN: GET TEMPLATE CONFIG
  async getTemplateConfig(adminToken: string, eventId?: string): Promise<CertificateConfig> {
    const query = eventId ? `?eventId=${eventId}` : '';
    const res = await safeFetchJson<{ templateConfig: CertificateConfig }>(`/api/admin/template${query}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.success && res.data?.templateConfig) {
      return res.data.templateConfig;
    }
    return localDb.getTemplateConfig(eventId);
  },

  // ADMIN: SAVE TEMPLATE CONFIG
  async saveTemplateConfig(
    adminToken: string,
    eventIdOrKey: string,
    config: CertificateConfig,
    applyToAll: boolean = true
  ): Promise<CertificateConfig> {
    const res = await safeFetchJson<{ templateConfig: CertificateConfig }>('/api/admin/template', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        key: eventIdOrKey,
        eventId: eventIdOrKey !== 'global' ? eventIdOrKey : undefined,
        config: { ...config, id: eventIdOrKey, eventId: eventIdOrKey !== 'global' ? eventIdOrKey : undefined },
        applyToAll,
      }),
    });

    const localSaved = localDb.saveTemplateConfig(
      {
        ...config,
        id: eventIdOrKey,
        eventId: eventIdOrKey !== 'global' ? eventIdOrKey : undefined,
      },
      applyToAll
    );
    if (res.success && res.data?.templateConfig) {
      return res.data.templateConfig;
    }
    return localSaved;
  },

  // ADMIN: EXPORT CSV (Returns Blob / CSV string)
  async downloadCsv(adminToken: string, eventId?: string): Promise<void> {
    const query = eventId ? `?eventId=${eventId}` : '';
    try {
      const res = await fetch(`/api/admin/export/csv${query}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Peserta_Sertifikat_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // Fallback
    }

    // Client-side CSV generation
    const csvContent = localDb.generateCsv(eventId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Peserta_Sertifikat_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
};
