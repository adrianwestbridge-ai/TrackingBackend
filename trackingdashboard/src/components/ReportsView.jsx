import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Eye, Globe, User, Phone, Mail, CheckCircle2, Printer, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportSessionsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';
import PaginationFooter from './PaginationFooter';

export default function ReportsView({ sessions = [], onSelectSession }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [exportFormat, setExportFormat] = useState('CSV');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const filteredSessions = sessions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.id && s.id.toLowerCase().includes(term)) ||
      (s.referenceId && s.referenceId.toLowerCase().includes(term)) ||
      (s.customerName && s.customerName.toLowerCase().includes(term)) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(term)) ||
      (s.mobile && s.mobile.toLowerCase().includes(term)) ||
      (s.trafficSource && s.trafficSource.toLowerCase().includes(term))
    );
  });

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportSessionsToCSV(filteredSessions, `MongoDB_Tracking_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(filteredSessions, `MongoDB_Tracking_Raw_Data_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Audit Reports & Data Export</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
              Real-time campaign attribution reports, visitor telemetry, and lead conversion logs.
            </p>
          </div>

          {/* Unified Clean Single Export Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="CSV">📊 Export CSV Spreadsheet (.csv)</option>
              <option value="JSON">💻 Export Raw Data (.json)</option>
              <option value="PDF">🖨️ Print / PDF Executive Report</option>
            </select>

            <button className="btn-primary" onClick={handleExport} style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
              <Download size={15} /> Export Report ({filteredSessions.length})
            </button>
          </div>
        </div>

        {/* Filter Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>DATE RANGE</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#2563eb" /> All Live Data ({new Date().toLocaleDateString()})
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>ATTRIBUTION MODEL</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
              Multi-Touch PPC & Organic Loop
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL CAPTURED ENTRIES</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px', color: '#16a34a' }}>
              {sessions.length} Verified Records
            </div>
          </div>
        </div>
      </div>

      {/* Main Audit Data Table Card */}
      <div className="card">
        <div className="search-toolbar" style={{ flexWrap: 'wrap', gap: '14px', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#2563eb" /> Live Audit Log Table
          </div>
          <input
            type="text"
            className="search-input"
            style={{ maxWidth: '320px' }}
            placeholder="Search report entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Reference #</th>
                <th>Customer Name</th>
                <th>Contact Email & Phone</th>
                <th>Query Category</th>
                <th>Traffic Source</th>
                <th>Client IP</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentSessions.length > 0 ? (
                currentSessions.map((s) => (
                  <tr key={s.id} onClick={() => onSelectSession && onSelectSession(s)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      <span className="user-id-green">{s.id.substring(0, 14)}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fecaca', fontWeight: 700, fontFamily: 'monospace' }}>
                        #{s.referenceId}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {s.customerName}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 500 }}>{s.customerEmail}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>{s.mobile}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px' }}>
                        {s.queryType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>
                        {s.trafficSource}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                        {s.adPlatform}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}>
                      {s.ip}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {s.timestamp}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession && onSelectSession(s);
                        }}
                      >
                        <Eye size={13} /> View Audit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No report data matching search filter.
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
    </div>
  );
}
