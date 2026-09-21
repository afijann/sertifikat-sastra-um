import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PublicStudentPage } from './pages/PublicStudentPage';
import { PublicVerificationPage } from './pages/PublicVerificationPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminPanel } from './pages/admin/AdminPanel';

export default function App() {
  const [currentView, setCurrentView] = useState<'student' | 'verify' | 'admin-login' | 'admin-dashboard'>('student');
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('sastra_admin_token');
  });
  const [activeEventSlug, setActiveEventSlug] = useState<string | undefined>(undefined);
  const [verificationCertNumber, setVerificationCertNumber] = useState<string | undefined>(undefined);
  const [activeEventTitle, setActiveEventTitle] = useState<string | undefined>(undefined);

  // Initialize Route from window.location
  useEffect(() => {
    const handlePopState = () => {
      parseRoute(window.location.pathname);
    };

    parseRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    fetchActiveEventTicker();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const fetchActiveEventTicker = async () => {
    try {
      const res = await fetch('/api/public/active-event');
      if (res.ok) {
        const data = await res.json();
        if (data.event) {
          setActiveEventTitle(data.event.title);
        }
      }
    } catch {
      // Non-blocking ticker fetch
    }
  };

  const parseRoute = (pathname: string) => {
    if (pathname.startsWith('/verify')) {
      const parts = pathname.split('/verify');
      const certNum = parts[1] ? decodeURIComponent(parts[1].replace(/^\//, '')) : undefined;
      setVerificationCertNumber(certNum || undefined);
      setCurrentView('verify');
    } else if (pathname.startsWith('/event/')) {
      const slug = pathname.replace('/event/', '').split('/')[0];
      setActiveEventSlug(slug);
      setCurrentView('student');
    } else if (pathname === '/admin' || pathname === '/admin/login') {
      const token = localStorage.getItem('sastra_admin_token');
      if (token) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    } else if (pathname.startsWith('/admin/')) {
      const token = localStorage.getItem('sastra_admin_token');
      if (token) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    } else {
      setCurrentView('student');
    }
  };

  const navigateTo = (view: 'student' | 'verify' | 'admin-login' | 'admin-dashboard', path?: string) => {
    setCurrentView(view);
    const targetPath = path || (
      view === 'student' ? '/' :
      view === 'verify' ? '/verify' :
      view === 'admin-login' ? '/admin/login' :
      '/admin'
    );
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleAdminLoginSuccess = (token: string) => {
    localStorage.setItem('sastra_admin_token', token);
    setAdminToken(token);
    navigateTo('admin-dashboard', '/admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('sastra_admin_token');
    setAdminToken(null);
    navigateTo('student', '/');
  };

  const handleNavigateToVerify = (certNumber?: string) => {
    setVerificationCertNumber(certNumber);
    if (certNumber) {
      navigateTo('verify', `/verify/${encodeURIComponent(certNumber)}`);
    } else {
      navigateTo('verify', '/verify');
    }
  };

  const handleViewPublicEvent = (slug?: string) => {
    setActiveEventSlug(slug);
    if (slug) {
      navigateTo('student', `/event/${slug}`);
    } else {
      navigateTo('student', '/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-slate-800 flex flex-col font-sans selection:bg-[#C5A059] selection:text-[#4A0E18]">
      
      {/* Universal Institutional Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'student') {
            setActiveEventSlug(undefined);
            navigateTo('student', '/');
          } else if (view === 'verify') {
            setVerificationCertNumber(undefined);
            navigateTo('verify', '/verify');
          } else if (view === 'admin-dashboard') {
            navigateTo('admin-dashboard', '/admin');
          } else if (view === 'admin-login') {
            navigateTo('admin-login', '/admin/login');
          }
        }}
        isAdminLoggedIn={!!adminToken}
        onAdminLogout={handleAdminLogout}
        activeEventTitle={activeEventTitle}
      />

      {/* Main Routing Views */}
      <div className="flex-1">
        {currentView === 'student' && (
          <PublicStudentPage
            initialEventSlug={activeEventSlug}
            onNavigateToVerify={handleNavigateToVerify}
            onNavigateToAdmin={() => {
              if (adminToken) {
                navigateTo('admin-dashboard', '/admin');
              } else {
                navigateTo('admin-login', '/admin/login');
              }
            }}
          />
        )}

        {currentView === 'verify' && (
          <PublicVerificationPage
            initialCertNumber={verificationCertNumber}
            onBackToHome={() => {
              setActiveEventSlug(undefined);
              navigateTo('student', '/');
            }}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToHome={() => navigateTo('student', '/')}
          />
        )}

        {currentView === 'admin-dashboard' && (
          adminToken ? (
            <AdminPanel
              adminToken={adminToken}
              onLogout={handleAdminLogout}
              onViewPublic={handleViewPublicEvent}
              onNavigateToVerify={handleNavigateToVerify}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToHome={() => navigateTo('student', '/')}
            />
          )
        )}
      </div>

      {/* Institutional Academic Footer */}
      <footer className="bg-[#4A0E18] text-white/80 border-t border-[#6B1724] py-8 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <div className="font-cinzel font-bold text-white tracking-wider text-sm">
              DEPARTEMEN SASTRA INDONESIA
            </div>
            <div>
              Fakultas Sastra • Universitas Negeri Malang (UM)
            </div>
            <div className="text-white/60 text-[11px]">
              Jl. Semarang No. 5, Malang, Jawa Timur 65145
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/60 text-[11px]">
            <button
              onClick={() => handleNavigateToVerify()}
              className="hover:text-[#C5A059] transition-colors"
            >
              Cek Keaslian Sertifikat
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (adminToken) {
                  navigateTo('admin-dashboard', '/admin');
                } else {
                  navigateTo('admin-login', '/admin/login');
                }
              }}
              className="hover:text-[#C5A059] transition-colors"
            >
              Portal Admin
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
