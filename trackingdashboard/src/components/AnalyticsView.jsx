import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, PieChart, Monitor, Smartphone, Tablet, Globe, CheckCircle2, Download, Code, Printer } from 'lucide-react';
import { exportSessionsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';

export default function AnalyticsView({ sessions = [] }) {
  const [exportFormat, setExportFormat] = useState('CSV');

  // Compute Device distribution dynamically from real sessions
  const deviceStats = useMemo(() => {
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;

    sessions.forEach((s) => {
      const dev = (s.device || '').toLowerCase();
      if (dev.includes('iphone') || dev.includes('android') || dev.includes('mobile')) {
        mobile++;
      } else if (dev.includes('ipad') || dev.includes('tablet')) {
        tablet++;
      } else {
        desktop++;
      }
    });

    const total = sessions.length || 1;
    return {
      mobileCount: mobile,
      desktopCount: desktop,
      tabletCount: tablet,
      mobilePct: Math.round((mobile / total) * 100),
      desktopPct: Math.round((desktop / total) * 100),
      tabletPct: Math.round((tablet / total) * 100),
    };
  }, [sessions]);

  // Compute Traffic Source breakdown dynamically
  const sourceStats = useMemo(() => {
    const counts = {};
    sessions.forEach((s) => {
      const src = s.trafficSource || 'Unknown';
      counts[src] = (counts[src] || 0) + 1;
    });

    const total = sessions.length || 1;
    return Object.keys(counts).map((source) => ({
      source,
      count: counts[source],
      pct: Math.round((counts[source] / total) * 100),
    }));
  }, [sessions]);

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportSessionsToCSV(sessions, `Telemetry_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(sessions, `Telemetry_Analytics_Raw_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Real-Time Telemetry & Traffic Analytics
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '2px' }}>
              Live metrics derived from verified visitor telemetry ({sessions.length} sessions tracked).
            </p>
          </div>

          {/* Unified Format Selector & Export Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              }}
            >
              <option value="CSV">📊 Export CSV (.csv)</option>
              <option value="JSON">💻 Export JSON (.json)</option>
              <option value="PDF">🖨️ Print / PDF Report</option>
            </select>

            <button className="btn-primary" onClick={handleExport} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Download size={14} /> Export Telemetry ({sessions.length})
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0', gap: '12px' }}>
            {[
              { time: 'TikTok', count: sessions.filter(s => s.trafficSource === 'TikTok').length, height: `${Math.max(20, (sessions.filter(s => s.trafficSource === 'TikTok').length / (sessions.length || 1)) * 100)}%` },
              { time: 'Google', count: sessions.filter(s => s.trafficSource === 'Google').length, height: `${Math.max(20, (sessions.filter(s => s.trafficSource === 'Google').length / (sessions.length || 1)) * 100)}%` },
              { time: 'Facebook', count: sessions.filter(s => s.trafficSource === 'Facebook').length, height: `${Math.max(20, (sessions.filter(s => s.trafficSource === 'Facebook').length / (sessions.length || 1)) * 100)}%` },
              { time: 'Instagram', count: sessions.filter(s => s.trafficSource === 'Instagram').length, height: `${Math.max(20, (sessions.filter(s => s.trafficSource === 'Instagram').length / (sessions.length || 1)) * 100)}%` },
            ].map((bar, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>{bar.count}</span>
                <div style={{ width: '100%', maxWidth: '40px', height: bar.height, backgroundColor: '#2563eb', borderRadius: '4px 4px 0 0', transition: 'all 0.3s ease' }}></div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginTop: '8px' }}>{bar.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid for Devices and Traffic breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <Monitor size={18} color="#2563eb" /> Device Types Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Smartphone size={15} color="#16a34a" /> Mobile Devices
                </span>
                <strong>{deviceStats.mobilePct}% ({deviceStats.mobileCount})</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${deviceStats.mobilePct}%`, height: '100%', background: '#16a34a' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Monitor size={15} color="#2563eb" /> Desktop Systems
                </span>
                <strong>{deviceStats.desktopPct}% ({deviceStats.desktopCount})</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${deviceStats.desktopPct}%`, height: '100%', background: '#2563eb' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Tablet size={15} color="#9333ea" /> Tablets
                </span>
                <strong>{deviceStats.tabletPct}% ({deviceStats.tabletCount})</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${deviceStats.tabletPct}%`, height: '100%', background: '#9333ea' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <PieChart size={18} color="#16a34a" /> Live Traffic Sources Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sourceStats.map((item) => (
              <div key={item.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>{item.source}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                  {item.count} sessions ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
