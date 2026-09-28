import React, { useState, useMemo, useEffect } from 'react';
import { Search, ExternalLink, Copy, Check, Eye, Globe, Filter, User, Phone, Mail, FileText, Monitor, Download, ChevronLeft, ChevronRight, Code, Printer } from 'lucide-react';
import { exportSessionsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';
import PaginationFooter from './PaginationFooter';

// `sessions` here has already been narrowed to the selected website (if any)
// by the global "Filter Website" dropdown in the Header - this view only
// applies its own search term on top of that.
export default function SessionsView({ sessions, onSelectSession }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [exportFormat, setExportFormat] = useState('CSV');

  // Filter sessions by Search Term only (website filtering happens globally in App.jsx)
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const term = searchTerm.toLowerCase();
      return (
        session.id.toLowerCase().includes(term) ||
        (session.referenceId && session.referenceId.toLowerCase().includes(term)) ||
        (session.customerName && session.customerName.toLowerCase().includes(term)) ||
        (session.customerEmail && session.customerEmail.toLowerCase().includes(term)) ||
        (session.mobile && session.mobile.toLowerCase().includes(term)) ||
        (session.queryType && session.queryType.toLowerCase().includes(term)) ||
        session.landingPage.toLowerCase().includes(term) ||
        session.ip.toLowerCase().includes(term)
      );
    });
  }, [sessions, searchTerm]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  const handleCopy = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportSessionsToCSV(filteredSessions, `MongoDB_Sessions_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(filteredSessions, `MongoDB_Sessions_Raw_Data_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  return (
    <div className="card">
      {/* Search and Website Filter Toolbar */}
      <div className="search-toolbar" style={{ flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div className="search-input-wrapper" style={{ flex: '1', minWidth: '240px' }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search Name, Email, Mobile, Session ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            <Download size={14} /> Export Sessions ({filteredSessions.length})
          </button>
        </div>
      </div>

      {/* Captured Frontend Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Session / Ref ID</th>
              <th>Website Source</th>
              <th>Customer Contact</th>
              <th>Mobile</th>
              <th>Query Category</th>
              <th>Device & IP</th>
              <th>Captured Time</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSessions.length > 0 ? (
              currentSessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  title="Click row to inspect all captured details"
                >
                  {/* Session / Ref ID */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="user-id-green" style={{ fontSize: '0.82rem' }}>
                        {session.id}
                      </span>
                      {session.referenceId && (
                        <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600, fontFamily: 'monospace' }}>
                          #{session.referenceId}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Website Source URL */}
                  <td>
                    <a
                      href={session.landingPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="landing-url"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '0.83rem', fontWeight: 600 }}
                    >
                      {session.landingPage}
                      <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                    </a>
                  </td>

                  {/* Customer Contact Name & Email */}
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                      {session.customerName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {session.customerEmail}
                    </div>
                  </td>

                  {/* Mobile Number */}
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', fontFamily: 'monospace' }}>
                      {session.mobile}
                    </span>
                  </td>

                  {/* Query Category */}
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {session.queryType}
                    </span>
                  </td>

                  {/* Device & IP Address */}
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                      {session.device} ({session.os})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                      IP: {session.ip}
                    </div>
                  </td>

                  {/* Captured Time */}
                  <td style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                    {session.timestamp}
                  </td>

                  {/* Actions Column */}
                  <td style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px',
                      }}
                    >
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        onClick={(e) => handleCopy(e, session.id)}
                        title="Copy Session ID"
                      >
                        {copiedId === session.id ? (
                          <Check size={13} color="#16a34a" />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedId === session.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe', fontWeight: 600 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(session);
                        }}
                        title="Inspect All Info"
                      >
                        <Eye size={13} />
                        <span>Inspect All</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No captured data found matching "<strong>{searchTerm}</strong>".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reusable Enterprise Pagination Footer with Ellipsis */}
      <PaginationFooter
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={totalItems}
        pageSizeOptions={[8, 15, 25, 50, 100]}
      />
    </div>
  );
}
