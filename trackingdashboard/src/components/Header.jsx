import React, { useState } from 'react';
import { RefreshCw, Plus, Globe } from 'lucide-react';

export default function Header({ pageTitle, onRefresh, onAddManual, websiteFilter, setWebsiteFilter, websiteOptions }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <header className="top-header">
      <h2 className="page-title">{pageTitle}</h2>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Global Website Filter - applies to every tab, not just this page.
            "All Websites" is the super-admin view; picking one site narrows
            every tab down to just that site's data. */}
        {websiteOptions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} color="#475569" />
            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
              title="Filter every tab down to one website's data"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: websiteFilter !== 'All' ? '#eff6ff' : '#ffffff',
                borderColor: websiteFilter !== 'All' ? '#93c5fd' : '#cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '260px',
              }}
            >
              {websiteOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Refresh Data Button */}
        <button
          className="btn-secondary"
          onClick={handleRefreshClick}
          title="Refresh tracking data from MongoDB"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#0f172a',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <RefreshCw
            size={15}
            color="#2563eb"
            style={{
              transition: 'transform 0.6s ease',
              transform: isRefreshing ? 'rotate(360deg)' : 'none',
            }}
          />
          <span>Refresh</span>
        </button>

        {/* Executive Admin Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 12px 5px 6px',
            borderRadius: '24px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
          }}
          title="Logged in as System Admin"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            AD
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Admin</span>
        </div>
      </div>
    </header>
  );
}
