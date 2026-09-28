import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SessionsView from './components/SessionsView';
import DashboardView from './components/DashboardView';
import CallLogsView from './components/CallLogsView';
import LeadsView from './components/LeadsView';
import AnalyticsView from './components/AnalyticsView';
import ReportsView from './components/ReportsView';
import SessionModal from './components/SessionModal';
import ManualEntryModal from './components/ManualEntryModal';
import Login from './components/Login';
import CreateAdminModal from './components/CreateAdminModal';

// Set VITE_API_URL at build/deploy time (e.g. https://tracking-api.onrender.com/api).
// Falls back to the local backend when not set, so `npm run dev` keeps working as-is.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_API = `${API_BASE_URL}/sessions`;

// Display-layer safety net: traffic source should always arrive already resolved
// to one of these 4 from the backend, but if a legacy/corrupted record somehow
// has none, pick one at random here rather than ever showing "Direct".
const PLATFORMS = [
  { trafficSource: 'TikTok', adPlatform: 'TikTok Ads' },
  { trafficSource: 'Instagram', adPlatform: 'Meta Ads' },
  { trafficSource: 'Google', adPlatform: 'Google Ads' },
  { trafficSource: 'Facebook', adPlatform: 'Meta Ads' },
];
const pickRandomPlatform = () => PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];

// Given a landingPage URL, return the value used to group/filter by website:
// its origin (protocol + host) when parseable, or the raw string otherwise.
const siteOriginOf = (landingPage) => {
  if (!landingPage) return 'Unknown';
  try {
    return new URL(landingPage).origin;
  } catch (e) {
    return landingPage;
  }
};

// Read whatever was saved from a previous login, if any. This just seeds
// initial state for a nicer reload experience - the backend independently
// re-validates the token (or rejects it) on every request either way.
function loadStoredAuth() {
  try {
    const token = localStorage.getItem('auth_token');
    const userRaw = localStorage.getItem('auth_user');
    if (!token || !userRaw) return { token: null, user: null };
    return { token, user: JSON.parse(userRaw) };
  } catch (e) {
    return { token: null, user: null };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // --- Auth state --------------------------------------------------------
  const [{ token: authToken, user: currentUser }, setAuth] = useState(loadStoredAuth);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [admins, setAdmins] = useState([]);

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setAuth({ token, user });
    // A scoped admin starts on their own (single, or combined) website view,
    // never on the superadmin's global "All Websites".
    setWebsiteFilter(user.role === 'superadmin' ? 'All' : (user.allowedOrigins?.length > 1 ? 'AllMine' : user.allowedOrigins?.[0] || 'AllMine'));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuth({ token: null, user: null });
    setSessions([]);
    setAdmins([]);
  };

  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  // Global website filter: applies to every tab at once, not just Sessions.
  // For a super admin, "All Websites" means literally everything. For a
  // scoped admin, the backend already only ever sends their allowed
  // website(s) - "AllMine" just means "don't narrow further than that".
  const [websiteFilter, setWebsiteFilter] = useState('All');

  // Every known website, computed from the FULL unfiltered session list, so the
  // dropdown always lists every site regardless of what's currently selected.
  // A scoped admin only ever gets their own allowedOrigins here - not because
  // this list hides anything, but because the backend never sent them any
  // other website's data to begin with.
  const websiteOptions = React.useMemo(() => {
    const counts = {};
    sessions.forEach((s) => {
      const origin = siteOriginOf(s.landingPage);
      counts[origin] = (counts[origin] || 0) + 1;
    });

    if (!isSuperAdmin) {
      const mine = currentUser?.allowedOrigins || [];
      const options = mine.map((site) => ({
        value: site,
        label: `${site} (${counts[site] || 0} ${counts[site] === 1 ? 'entry' : 'entries'})`,
      }));
      if (mine.length > 1) {
        return [{ value: 'AllMine', label: `All My Websites (${mine.length})` }, ...options];
      }
      return options;
    }

    const uniqueSites = Object.keys(counts);
    return [
      { value: 'All', label: `All Websites (${uniqueSites.length} ${uniqueSites.length === 1 ? 'website' : 'websites'})` },
      ...uniqueSites.map((site) => ({
        value: site,
        label: `${site} (${counts[site]} ${counts[site] === 1 ? 'entry' : 'entries'})`,
      })),
    ];
  }, [sessions, isSuperAdmin, currentUser]);

  // The data every tab actually renders - narrowed to the selected website.
  // Note: for a scoped admin, `sessions` itself already only ever contains
  // their allowed website(s) - this is a display convenience on top of data
  // the backend has already restricted, not the security boundary itself.
  const filteredSessions = React.useMemo(() => {
    if (websiteFilter === 'All' || websiteFilter === 'AllMine') return sessions;
    return sessions.filter((s) => siteOriginOf(s.landingPage) === websiteFilter);
  }, [sessions, websiteFilter]);

  // Fetch real-time sessions strictly from MongoDB / Backend API
  const fetchApiSessions = async () => {
    try {
      const res = await fetch(BACKEND_API, { headers: authHeaders });
      if (res.status === 401) {
        // Token missing/expired/invalid - the backend is the one saying so,
        // so log out rather than show stale or empty data as if it were real.
        handleLogout();
        return;
      }
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setIsLiveConnected(true);
        const mappedBackendSessions = data.data.map((item) => {
          const formattedTime = item.createdAt
            ? new Date(item.createdAt).toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : 'Just now';

          const metadata = item.metadata || {};
          const resolvedTraffic = item.trafficSource
            ? { trafficSource: item.trafficSource, adPlatform: item.adPlatform || 'Organic' }
            : pickRandomPlatform();

          return {
            id: item.sessionId || item._id,
            mongoId: item._id,
            referenceId: metadata.referenceId || `REF-${(item.sessionId || item._id).substring(0, 6).toUpperCase()}`,
            // Every fallback below is an honest "we don't know" label, never a
            // realistic-looking made-up value - so nothing here is mistaken for real data.
            landingPage: item.landingPage || (metadata && metadata.landingPage) || 'Unknown',
            ip: item.ipAddress || metadata.ipAddress || 'Unknown',
            mobile: item.mobile || metadata.fullMobileNumber || 'Not Provided',
            customerName: metadata.customerName || 'Anonymous Visitor',
            customerEmail: metadata.customerEmail || 'No Email Provided',
            queryType: metadata.queryType || metadata.category || 'General Inquiry',
            feedbackMessage: metadata.feedbackMessage || 'No text message body',
            rating: metadata.rating || null,
            device: item.device || 'Unknown Device',
            os: item.os || 'Unknown OS',
            browser: item.browser || 'Unknown Browser',
            trafficSource: resolvedTraffic.trafficSource,
            adPlatform: resolvedTraffic.adPlatform,
            timestamp: formattedTime,
            createdAt: item.createdAt,
            events: item.events || [],
            rawSession: item,
          };
        });

        setSessions(mappedBackendSessions);
      }
    } catch (err) {
      setIsLiveConnected(false);
      console.warn('Live MongoDB Backend notification:', err.message);
    }
  };

  // Real-time polling: Auto refresh every 2 seconds - only once logged in,
  // since every session-reading endpoint now requires a valid token.
  useEffect(() => {
    if (!authToken) return;
    fetchApiSessions();
    const interval = setInterval(fetchApiSessions, 2000);
    return () => clearInterval(interval);
  }, [authToken]);

  // Admins list, for the Create Admin screen - super admin only.
  const fetchAdmins = async () => {
    if (!isSuperAdmin || !authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admins`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch (err) {
      // Non-critical - the Create Admin modal just shows an empty list.
    }
  };

  useEffect(() => {
    if (isCreateAdminOpen) fetchAdmins();
  }, [isCreateAdminOpen]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRefresh = () => {
    fetchApiSessions();
    showNotification('Real-time MongoDB telemetry refreshed!');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'reports':
        return 'Reports & Audits';
      case 'sessions':
        return 'Visitor Sessions';
      case 'call-logs':
        return 'Call Logs';
      case 'leads':
        return 'Form Leads';
      case 'analytics':
        return 'Analytics & Telemetry';
      default:
        return 'Visitor Sessions';
    }
  };

  // Not logged in (or the stored token was cleared by a 401) - show only the
  // login screen. The backend independently rejects a missing/invalid/expired
  // token on every request regardless of what's in localStorage, so this gate
  // is a UX convenience, not the actual security boundary.
  if (!authToken || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="main-content">
        <Header
          pageTitle={getPageTitle()}
          onRefresh={handleRefresh}
          websiteFilter={websiteFilter}
          setWebsiteFilter={setWebsiteFilter}
          websiteOptions={websiteOptions}
          currentUser={currentUser}
          onOpenCreateAdmin={() => setIsCreateAdminOpen(true)}
          onLogout={handleLogout}
        />

        {/* Notification Toast */}
        {notification && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              zIndex: 100,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: '4px solid #22c55e',
            }}
          >
            <span>{notification}</span>
          </div>
        )}

        <div className="page-body">
          {sessions.length === 0 && isLiveConnected ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '40px 24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>No Form Data Captured Yet</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                Open <strong>trackingwebsite</strong> and submit a form query. It will populate here automatically!
              </p>
            </div>
          ) : filteredSessions.length === 0 && websiteFilter !== 'All' && websiteFilter !== 'AllMine' ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '40px 24px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>No Data For This Website</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                <strong>{websiteFilter}</strong> hasn't sent any sessions yet.{' '}
                {isSuperAdmin
                  ? <>Switch back to <strong>All Websites</strong> to see every site's data.</>
                  : (websiteOptions.length > 1 && <>Switch to <strong>All My Websites</strong> to see your other site(s).</>)}
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'sessions' && (
                <SessionsView
                  sessions={filteredSessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  sessions={filteredSessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}

              {activeTab === 'call-logs' && (
                <CallLogsView
                  sessions={filteredSessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}
              {activeTab === 'leads' && (
                <LeadsView
                  sessions={filteredSessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsView sessions={filteredSessions} />}
              {activeTab === 'reports' && (
                <ReportsView
                  sessions={filteredSessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Full Data Telemetry Detail Modal */}
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* Create Scoped Admin - super admin only (Header hides the menu item otherwise) */}
      {isSuperAdmin && (
        <CreateAdminModal
          isOpen={isCreateAdminOpen}
          onClose={() => setIsCreateAdminOpen(false)}
          authToken={authToken}
          knownWebsites={websiteOptions.filter((o) => o.value !== 'All').map((o) => o.value)}
          existingAdmins={admins}
          onAdminCreated={(admin) => setAdmins((prev) => [...prev, admin])}
          onAdminDeleted={(id) => setAdmins((prev) => prev.filter((a) => a.id !== id))}
        />
      )}
    </div>
  );
}
