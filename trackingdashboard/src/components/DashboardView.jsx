import React, { useState } from 'react';
import { Activity, PhoneCall, Users, TrendingUp, DollarSign, Globe, Download, Search, Settings, DollarSign as DollarIcon, ExternalLink } from 'lucide-react';
import { exportSessionsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';

export default function DashboardView({ sessions = [], onSelectSession }) {
  const [exportFormat, setExportFormat] = useState('CSV');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCplSettings, setShowCplSettings] = useState(false);

  // Dynamic Cost Per Lead (CPL) state per platform
  const [cplRates, setCplRates] = useState({
    Google: 15.00,
    Facebook: 12.50,
    Instagram: 10.00,
    Bing: 14.00,
    Unknown: 0.00,
    TikTok: 11.00,
  });

  const filteredSessions = sessions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.id && s.id.toLowerCase().includes(term)) ||
      (s.landingPage && s.landingPage.toLowerCase().includes(term)) ||
      (s.trafficSource && s.trafficSource.toLowerCase().includes(term)) ||
      (s.customerName && s.customerName.toLowerCase().includes(term))
    );
  });

  // Calculate leads breakdown per channel
  const leadsByChannel = sessions.reduce((acc, s) => {
    const source = (s.trafficSource || 'Unknown').trim();
    if (source.toLowerCase().includes('google')) acc.Google = (acc.Google || 0) + 1;
    else if (source.toLowerCase().includes('facebook')) acc.Facebook = (acc.Facebook || 0) + 1;
    else if (source.toLowerCase().includes('instagram')) acc.Instagram = (acc.Instagram || 0) + 1;
    else if (source.toLowerCase().includes('bing')) acc.Bing = (acc.Bing || 0) + 1;
    else if (source.toLowerCase().includes('tiktok')) acc.TikTok = (acc.TikTok || 0) + 1;
    else acc.Unknown = (acc.Unknown || 0) + 1;
    return acc;
  }, { Google: 0, Facebook: 0, Instagram: 0, Bing: 0, Unknown: 0, TikTok: 0 });

  // Calculate ad spends based on form submissions
  const googleSpend = (leadsByChannel.Google || 0) * cplRates.Google;
  const facebookSpend = (leadsByChannel.Facebook || 0) * cplRates.Facebook;
  const instagramSpend = (leadsByChannel.Instagram || 0) * cplRates.Instagram;
  const bingSpend = (leadsByChannel.Bing || 0) * cplRates.Bing;
  const tiktokSpend = (leadsByChannel.TikTok || 0) * cplRates.TikTok;
  
  const totalAdSpend = googleSpend + facebookSpend + instagramSpend + bingSpend + tiktokSpend;
  const totalPaidLeads = (leadsByChannel.Google || 0) + (leadsByChannel.Facebook || 0) + (leadsByChannel.Instagram || 0) + (leadsByChannel.Bing || 0) + (leadsByChannel.TikTok || 0);
  const avgCpl = totalPaidLeads > 0 ? (totalAdSpend / totalPaidLeads).toFixed(2) : '13.50';

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportSessionsToCSV(sessions, `Dashboard_Summary_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(sessions, `Dashboard_Summary_Raw_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Executive Performance & Ad Spend Overview
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Systematic tracking for form submissions, ad platform spend, and inbound lead telemetry.
          </p>
        </div>

        {/* Clean Single Export Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowCplSettings(!showCplSettings)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: showCplSettings ? '#eff6ff' : '#ffffff',
              borderColor: showCplSettings ? '#2563eb' : '#cbd5e1',
              color: showCplSettings ? '#2563eb' : '#0f172a',
            }}
          >
            <Settings size={15} />
            <span>{showCplSettings ? 'Hide CPL Settings' : 'Configure CPL Rates'}</span>
          </button>

          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <option value="CSV">📊 Export CSV (.csv)</option>
            <option value="JSON">💻 Export JSON (.json)</option>
            <option value="PDF">🖨️ Print / PDF Report</option>
          </select>

          <button className="btn-primary" onClick={handleExport} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={14} /> Export Report ({sessions.length})
          </button>
        </div>
      </div>

      {/* CPL Rate Config Drawer */}
      {showCplSettings && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '16px 20px',
            border: '1px solid #bfdbfe',
            boxShadow: '0 4px 12px rgba(37,99,235,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
              ⚙️ Cost Per Lead (CPL) Settings (Systematic Spend Calculation)
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Changes auto-calculate dashboard ad spend dynamically from form submissions
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {Object.keys(cplRates).map((channel) => (
              <div key={channel} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                  {channel} CPL ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={cplRates[channel]}
                  onChange={(e) => setCplRates({ ...cplRates, [channel]: parseFloat(e.target.value) || 0 })}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Total Estimated Ad Spend</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
              <DollarSign size={18} color="#16a34a" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#16a34a' }}>
            ${totalAdSpend.toFixed(2)}
          </div>
          <div className="metric-trend trend-up">
            <TrendingUp size={14} /> Calculated from {sessions.length} Form Submissions
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Google Ads Spend</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
              <DollarIcon size={18} color="#2563eb" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#2563eb' }}>
            ${googleSpend.toFixed(2)}
          </div>
          <div className="metric-trend trend-up">
            <span>{leadsByChannel.Google || 0} Submissions @ ${cplRates.Google}/lead</span>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Facebook Ads Spend</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#faf5ff' }}>
              <DollarIcon size={18} color="#9333ea" />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#9333ea' }}>
            ${facebookSpend.toFixed(2)}
          </div>
          <div className="metric-trend trend-up">
            <span>{leadsByChannel.Facebook || 0} Submissions @ ${cplRates.Facebook}/lead</span>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Form Lead Conversions</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fff7ed' }}>
              <Users size={18} color="#ea580c" />
            </div>
          </div>
          <div className="metric-value">{sessions.length}</div>
          <div className="metric-trend trend-up">
            <TrendingUp size={14} /> Avg Cost Per Lead: ${avgCpl}
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Active Sessions Card */}
        <div className="card">
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Live Visitor Telemetry & Form Feed</h3>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '12px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                • Auto Updating
              </span>
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Filter telemetry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Reference</th>
                  <th>Landing Page</th>
                  <th>Traffic Source</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.slice(0, 8).map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => onSelectSession && onSelectSession(session)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <code style={{ fontSize: '0.82rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                        {session.referenceId || session.id.substring(0, 14)}
                      </code>
                    </td>
                    <td>
                      <span className="landing-url">{session.landingPage}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        {session.trafficSource || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {session.timestamp || 'Just now'}
                    </td>
                    <td>
                      <span className="badge badge-active">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Traffic & Ad Spend Attribution */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
              Ad Spend & Channel Attribution
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Calculated based on form submissions & CPL rates
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Google Ads (${googleSpend.toFixed(2)})</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>{leadsByChannel.Google || 0} Leads</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sessions.length ? ((leadsByChannel.Google || 0) / sessions.length) * 100 : 50}%`, backgroundColor: '#2563eb', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Facebook Ads (${facebookSpend.toFixed(2)})</span>
                <span style={{ color: '#9333ea', fontWeight: 700 }}>{leadsByChannel.Facebook || 0} Leads</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sessions.length ? ((leadsByChannel.Facebook || 0) / sessions.length) * 100 : 30}%`, backgroundColor: '#9333ea', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Instagram Ads (${instagramSpend.toFixed(2)})</span>
                <span style={{ color: '#ea580c', fontWeight: 700 }}>{leadsByChannel.Instagram || 0} Leads</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sessions.length ? ((leadsByChannel.Instagram || 0) / sessions.length) * 100 : 10}%`, backgroundColor: '#ea580c', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Unknown ($0.00)</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{leadsByChannel.Unknown || 0} Leads</span>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sessions.length ? ((leadsByChannel.Unknown || 0) / sessions.length) * 100 : 10}%`, backgroundColor: '#16a34a', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

