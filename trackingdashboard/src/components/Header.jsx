import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Plus, Globe, UserPlus, LogOut, ShieldCheck, User } from 'lucide-react';

export default function Header({
  pageTitle,
  onRefresh,
  websiteFilter,
  setWebsiteFilter,
  websiteOptions,
  currentUser,
  onOpenCreateAdmin,
  onLogout,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

        {/* Profile Pill - click to open account menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '5px 12px 5px 6px',
              borderRadius: '24px',
              backgroundColor: menuOpen ? '#eff6ff' : '#f8fafc',
              border: menuOpen ? '1px solid #93c5fd' : '1px solid #e2e8f0',
              cursor: 'pointer',
            }}
            title={`Logged in as ${currentUser?.username || 'Admin'} (${currentUser?.role === 'superadmin' ? 'Super Admin' : 'Admin'})`}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentUser?.role === 'superadmin' ? '#7c3aed' : '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78rem',
              }}
            >
              {(currentUser?.username || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
              {currentUser?.username || 'Admin'}
            </span>
          </div>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '220px',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={15} color={currentUser?.role === 'superadmin' ? '#7c3aed' : '#2563eb'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{currentUser?.username}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {currentUser?.role === 'superadmin' ? 'Super Admin — sees all websites' : 'Admin — scoped access'}
                  </div>
                </div>
              </div>

              {currentUser?.role === 'superadmin' && (
                <button
                  onClick={() => { setMenuOpen(false); onOpenCreateAdmin && onOpenCreateAdmin(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    color: '#0f172a', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <UserPlus size={15} color="#2563eb" /> Create Admin
                </button>
              )}

              <button
                onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  color: '#b91c1c', textAlign: 'left', borderTop: '1px solid #f1f5f9',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
