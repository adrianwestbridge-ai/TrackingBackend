import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { exportSessionsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';
import PaginationFooter from './PaginationFooter';

export default function LeadsView({ sessions = [], onSelectSession }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [exportFormat, setExportFormat] = useState('CSV');

  const totalItems = sessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentLeads = sessions.slice(startIndex, endIndex);

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportSessionsToCSV(sessions, `Captured_Form_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(sessions, `Captured_Form_Leads_Raw_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  return (
    <div className="card">
      <div className="search-toolbar" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Captured Form Leads ({sessions.length})</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Live incoming lead data submitted directly via frontend forms.</p>
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
            <Download size={14} /> Export Leads ({sessions.length})
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead Reference #</th>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Session ID</th>
              <th>Quotation Source</th>
              <th>Traffic Source</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.length > 0 ? (
              currentLeads.map((lead) => (
                <tr key={lead.id} onClick={() => onSelectSession && onSelectSession(lead)} style={{ cursor: 'pointer' }}>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca', fontWeight: 700, fontFamily: 'monospace' }}>
                      #{lead.referenceId}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{lead.customerName}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>{lead.customerEmail}</div>
                    <div style={{ fontSize: '0.78rem', color: '#15803d', fontFamily: 'monospace' }}>{lead.mobile}</div>
                  </td>
                  <td>
                    <span className="user-id-green">{lead.id.substring(0, 12)}...</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Click to Call
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{lead.trafficSource}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{lead.adPlatform}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{lead.timestamp}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession && onSelectSession(lead);
                      }}
                    >
                      <Eye size={13} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No lead entries captured yet. Submit a quote form on trackingwebsite to populate!
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
