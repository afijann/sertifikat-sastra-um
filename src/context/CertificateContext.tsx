import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CertificateConfig, EventItem } from '../types';
import { DEFAULT_UM_LOGO, DEFAULT_FS_LOGO, DEFAULT_DSI_LOGO } from '../utils/defaultLogos';
import { apiClient } from '../utils/apiClient';

export const INITIAL_CERTIFICATE_CONFIG: CertificateConfig = {
  id: 'global',
  certificateTitle: 'SERTIFIKAT',
  recipientPrefix: 'Diberikan kepada:',
  awardText: 'Sebagai peserta dalam kegiatan',
  signerName: 'Dr. Moch. Syahri, S.Sos., M.Si.',
  signerPosition: 'Ketua Departemen Sastra Indonesia',
  signerNip: 'NIP 197105282001121001',
  primaryColor: '#6B1724',
  secondaryColor: '#C5A059',
  logoUm: DEFAULT_UM_LOGO,
  logoFs: DEFAULT_FS_LOGO,
  logoDsi: DEFAULT_DSI_LOGO,
  signatureImage: '',
  stampImage: '',
  universityName: 'UNIVERSITAS NEGERI MALANG',
  facultyName: 'FAKULTAS SASTRA',
  departmentName: 'DEPARTEMEN SASTRA INDONESIA',
  eventName: 'Seminar Nasional Perpustakaan dan Informasi 2026',
  eventSubtitle: 'Mahasiswa Departemen Sastra Indonesia',
  eventDate: '21 September 2026',
  eventLocation: 'Aula Gedung D8 FS Universitas Negeri Malang',
  eventOrganizer: 'Departemen Sastra Indonesia, Fakultas Sastra, Universitas Negeri Malang',
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

export interface CertificateContextType {
  /** The single source of truth for all certificate elements */
  certificateConfig: CertificateConfig;
  /** Directly set the entire certificate configuration */
  setCertificateConfig: React.Dispatch<React.SetStateAction<CertificateConfig>>;
  /** Update individual or multiple certificate fields */
  updateCertificateConfig: (updates: Partial<CertificateConfig> | ((prev: CertificateConfig) => Partial<CertificateConfig>)) => void;
  /** Currently active event associated with the certificate */
  activeEvent: EventItem | null;
  /** Set or switch active event */
  setActiveEvent: (event: EventItem | null) => void;
  /** Load event and certificate config from backend */
  loadEventAndConfig: (slugOrId?: string) => Promise<{ event: EventItem | null; config: CertificateConfig }>;
  /** Save current config to backend database */
  saveCertificateConfig: (token: string, eventIdOrKey?: string, applyToAll?: boolean, configToSave?: CertificateConfig) => Promise<boolean>;
  /** Reset to default institutional configuration */
  resetToDefaults: () => void;
  /** Loading status */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

export interface CertificateProviderProps {
  children: ReactNode;
  initialConfig?: Partial<CertificateConfig>;
}

export const CertificateProvider: React.FC<CertificateProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig>(() => ({
    ...INITIAL_CERTIFICATE_CONFIG,
    ...(initialConfig || {}),
  }));
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to update specific fields in the unified certificate configuration
   */
  const updateCertificateConfig = useCallback((
    updates: Partial<CertificateConfig> | ((prev: CertificateConfig) => Partial<CertificateConfig>)
  ) => {
    setCertificateConfig((prev) => {
      const resolvedUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return {
        ...prev,
        ...resolvedUpdates,
      };
    });
  }, []);

  /**
   * Loads event and template config from the API and synchronizes the unified state
   */
  const loadEventAndConfig = useCallback(async (slugOrId?: string): Promise<{ event: EventItem | null; config: CertificateConfig }> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = slugOrId
        ? await apiClient.getEventBySlug(slugOrId)
        : await apiClient.getActiveEvent();

      let mergedConfig: CertificateConfig = { ...INITIAL_CERTIFICATE_CONFIG };

      if (data.templateConfig) {
        mergedConfig = {
          ...mergedConfig,
          ...data.templateConfig,
        };
      }

      if (data.event) {
        setActiveEvent(data.event);
        // Ensure event identity fields default to active event if not explicitly overridden
        mergedConfig = {
          ...mergedConfig,
          eventId: data.event.id,
          eventName: mergedConfig.eventName || data.event.title,
          eventSubtitle: mergedConfig.eventSubtitle !== undefined ? mergedConfig.eventSubtitle : data.event.subtitle,
          eventDate: mergedConfig.eventDate || data.event.date,
          eventLocation: mergedConfig.eventLocation || data.event.location,
          eventOrganizer: mergedConfig.eventOrganizer || data.event.organizer,
        };
      }

      setCertificateConfig(mergedConfig);
      setIsLoading(false);
      return { event: data.event || null, config: mergedConfig };
    } catch (err: any) {
      console.warn('CertificateContext: Could not fetch remote configuration, falling back to local defaults', err);
      setError(err.message || 'Gagal memuat konfigurasi sertifikat');
      setIsLoading(false);
      return { event: null, config: INITIAL_CERTIFICATE_CONFIG };
    }
  }, []);

  /**
   * Persists the current certificate configuration to the server
   */
  const saveCertificateConfig = useCallback(async (
    token: string,
    eventIdOrKey: string = 'global',
    applyToAll: boolean = false,
    configToSave?: CertificateConfig
  ): Promise<boolean> => {
    try {
      const target = configToSave || certificateConfig;
      const saved = await apiClient.saveTemplateConfig(token, eventIdOrKey, target, applyToAll);
      if (saved) {
        setCertificateConfig((prev) => ({
          ...prev,
          ...saved,
        }));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('CertificateContext: Failed to save certificate configuration', err);
      setError(err.message || 'Gagal menyimpan konfigurasi');
      return false;
    }
  }, [certificateConfig]);

  /**
   * Reset configuration to official defaults
   */
  const resetToDefaults = useCallback(() => {
    setCertificateConfig(INITIAL_CERTIFICATE_CONFIG);
  }, []);

  // Initial load on application startup - only once!
  useEffect(() => {
    loadEventAndConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CertificateContext.Provider
      value={{
        certificateConfig,
        setCertificateConfig,
        updateCertificateConfig,
        activeEvent,
        setActiveEvent,
        loadEventAndConfig,
        saveCertificateConfig,
        resetToDefaults,
        isLoading,
        error,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

/**
 * Hook to consume the unified certificate configuration anywhere in the app
 */
export function useCertificate(): CertificateContextType {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificate must be used within a CertificateProvider');
  }
  return context;
}
