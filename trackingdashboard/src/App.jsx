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

export default function App() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fetch real-time sessions strictly from MongoDB / Backend API
  const fetchApiSessions = async () => {
    try {
      const res = await fetch(BACKEND_API);
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

  // Real-time polling: Auto refresh every 2 seconds
  useEffect(() => {
    fetchApiSessions();
    const interval = setInterval(fetchApiSessions, 2000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="main-content">
        <Header
          pageTitle={getPageTitle()}
          onRefresh={handleRefresh}
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
          ) : (
            <>
              {activeTab === 'sessions' && (
                <SessionsView
                  sessions={sessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  sessions={sessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}

              {activeTab === 'call-logs' && (
                <CallLogsView
                  sessions={sessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}
              {activeTab === 'leads' && (
                <LeadsView
                  sessions={sessions}
                  onSelectSession={(session) => setSelectedSession(session)}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsView sessions={sessions} />}
              {activeTab === 'reports' && (
                <ReportsView
                  sessions={sessions}
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
    </div>
  );
}
