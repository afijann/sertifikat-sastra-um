import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminEventsPage } from './AdminEventsPage';
import { AdminParticipantsPage } from './AdminParticipantsPage';
import { AdminCertificatesPage } from './AdminCertificatesPage';
import { AdminTemplatePage } from './AdminTemplatePage';
import { AdminSettingsPage } from './AdminSettingsPage';

interface AdminPanelProps {
  adminToken: string;
  onLogout: () => void;
  onViewPublic: (slug?: string) => void;
  onNavigateToVerify: (certNumber: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminToken,
  onLogout,
  onViewPublic,
  onNavigateToVerify,
}) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'events' | 'participants' | 'certificates' | 'template' | 'settings'>('dashboard');
  const [contextEventId, setContextEventId] = useState<string | undefined>(undefined);

  const handleTabChangeWithContext = (tab: string, eventId?: string) => {
    setCurrentTab(tab as any);
    setContextEventId(eventId);
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] bg-[#F8F6F2]">
      {/* Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab as any);
          setContextEventId(undefined);
        }}
        onLogout={onLogout}
        onViewPublic={() => onViewPublic()}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto overflow-y-auto">
        {currentTab === 'dashboard' && (
          <AdminDashboardPage
            adminToken={adminToken}
            onNavigateTab={handleTabChangeWithContext}
            onViewPublicEvent={(slug) => onViewPublic(slug)}
          />
        )}

        {currentTab === 'events' && (
          <AdminEventsPage
            adminToken={adminToken}
            initialSelectedEventId={contextEventId}
            onSelectEventParticipants={(eventId) => {
              setCurrentTab('participants');
              setContextEventId(eventId);
            }}
            onViewPublicEvent={(slug) => onViewPublic(slug)}
          />
        )}

        {currentTab === 'participants' && (
          <AdminParticipantsPage
            adminToken={adminToken}
            initialEventFilter={contextEventId}
            onNavigateToVerify={onNavigateToVerify}
          />
        )}

        {currentTab === 'certificates' && (
          <AdminCertificatesPage
            adminToken={adminToken}
            onNavigateToVerify={onNavigateToVerify}
          />
        )}

        {currentTab === 'template' && (
          <AdminTemplatePage
            adminToken={adminToken}
            initialEventId={contextEventId}
          />
        )}

        {currentTab === 'settings' && (
          <AdminSettingsPage adminToken={adminToken} />
        )}
      </main>
    </div>
  );
};
