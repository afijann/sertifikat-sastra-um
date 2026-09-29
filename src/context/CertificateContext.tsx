import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CertificateConfig, EventItem } from '../types';
import {
  DEFAULT_UM_LOGO,
  DEFAULT_FS_LOGO,
  DEFAULT_DSI_LOGO,
  DEFAULT_SIGNATURE,
  DEFAULT_STAMP,
  DEFAULT_SIGNER_NAME,
  DEFAULT_SIGNER_POSITION,
  DEFAULT_SIGNER_NIP,
} from '../utils/defaultLogos';
import { apiClient } from '../utils/apiClient';

export const INITIAL_CERTIFICATE_CONFIG: CertificateConfig = {
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
  eventName: '',
  eventSubtitle: '',
  eventDate: '',
  eventLocation: '',
  eventOrganizer: '',
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

      let mergedConfig: CertificateConfig = {
        ...INITIAL_CERTIFICATE_CONFIG,
        ...(data.templateConfig || {}),
      };

      if (data.event) {
        setActiveEvent(data.event);
        // Ensure event identity fields default to active event if not explicitly overridden
        mergedConfig = {
          ...mergedConfig,
          eventId: data.event.id,
          eventName: data.templateConfig?.eventName || data.event.title,
          eventSubtitle: data.templateConfig?.eventSubtitle !== undefined ? data.templateConfig.eventSubtitle : (data.event.subtitle || ''),
          eventDate: data.templateConfig?.eventDate || data.event.date,
          eventLocation: data.templateConfig?.eventLocation || data.event.location,
          eventOrganizer: data.templateConfig?.eventOrganizer || data.event.organizer,
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
