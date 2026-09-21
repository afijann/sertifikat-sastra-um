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
  participantCount?: number;
}

export interface Participant {
  id: string;
  eventId: string;
  fullName: string;
  certificateNumber: string;
  createdAt: string;
  verificationCode: string;
  eventTitle?: string;
  eventDate?: string;
}

export interface CertificateConfig {
  id: string;
  eventId?: string;
  certificateTitle: string;
  recipientPrefix: string;
  awardText: string;
  signerName: string;
  signerPosition: string;
  signerNip?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUm?: string;
  logoFs?: string;
  logoDsi?: string;
  signatureImage?: string;
  stampImage?: string;
  universityName: string;
  facultyName: string;
  departmentName: string;
  fontSizeTitle: number;
  fontSizeName: number;
  fontSizeBody: number;
  frameStyle: 'classic-double' | 'ornament-gold' | 'minimal-modern';
  showQr: boolean;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalCertificates: number;
  certificatesToday: number;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
}
