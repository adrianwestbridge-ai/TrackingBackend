import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Download, Eye, Tag, Code, ChevronLeft, ChevronRight, Printer, Pencil, X } from 'lucide-react';
import { exportSessionsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';
import PaginationFooter from './PaginationFooter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LeadsView({ sessions = [], onSelectSession }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [exportFormat, setExportFormat] = useState('CSV');

  const [queryEdits, setQueryEdits] = useState({}); // lead.id -> edited Query / Service
  const [editingLead, setEditingLead] = useState(null);
  const [editQueryType, setEditQueryType] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Apply any locally-saved Query / Service edits on top of the live sessions
  const editedSessions = sessions.map((lead) =>
    queryEdits[lead.id] !== undefined ? { ...lead, queryType: queryEdits[lead.id] } : lead
  );

  const totalItems = editedSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentLeads = editedSessions.slice(startIndex, endIndex);

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportSessionsToCSV(editedSessions, `Captured_Form_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(editedSessions, `Captured_Form_Leads_Raw_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  const openEditLead = (lead) => {
    setEditingLead(lead);
    setEditQueryType(lead.queryType || '');
    setEditError('');
  };

  const closeEditLead = () => {
    setEditingLead(null);
    setEditError('');
  };

  // Only the Query / Service field is editable, so nothing else about the lead can be changed by mistake
  const handleSaveQueryType = async (e) => {
    e.preventDefault();
    const queryType = editQueryType.trim();
    if (!queryType || !editingLead) return;

    setIsSavingEdit(true);
    setEditError('');

    try {
      const session = editingLead.rawSession;
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: editingLead.id,
          landingPage: session?.landingPage,
          ipAddress: session?.ipAddress,
          metadata: { queryType },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Save failed');

      setQueryEdits((prev) => ({ ...prev, [editingLead.id]: queryType }));
      closeEditLead();
    } catch (err) {
      setEditError(`Could not save: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
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
              <th>Query / Service</th>
              <th>Traffic Source</th>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Edit</th>
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
                    <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {lead.queryType}
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
                  <td>
                    <button
                      className="btn-secondary"
                      title={`Edit Query / Service for ${lead.customerName}`}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        borderColor: '#bfdbfe',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditLead(lead);
                      }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
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

      {/* Edit Lead Modal — only Query / Service is editable, everything else is shown read-only
          so it's always clear whose lead is being edited */}
      {editingLead && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '460px', borderRadius: '12px' }}>
            <div className="modal-header" style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                ✏️ Edit Lead — #{editingLead.referenceId}
              </h3>
              <button onClick={closeEditLead} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveQueryType}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingLead.customerName || ''}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.88rem', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600, cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Email
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={editingLead.customerEmail || ''}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={editingLead.mobile || ''}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Session ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingLead.id || ''}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem', fontFamily: 'monospace', backgroundColor: '#f1f5f9', color: '#0f172a', cursor: 'not-allowed' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', display: 'block', marginBottom: '4px' }}>
                    Query / Service
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Auto Insurance Quote Request"
                    value={editQueryType}
                    onChange={(e) => setEditQueryType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #2563eb', fontSize: '0.88rem' }}
                  />
                </div>

                {editError && (
                  <div style={{ fontSize: '0.82rem', color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 12px' }}>
                    {editError}
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={closeEditLead}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSavingEdit}>
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
