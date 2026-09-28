import React, { useState, useMemo, useEffect } from 'react';
import { Play, Download, Pencil, Volume2, X, Phone, Clock, FileAudio, Upload, CheckCircle2, Search, Radio, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportCallLogsToCSV, exportSessionsToJSON, printExecutiveAuditReport } from '../utils/exportCsv';
import PaginationFooter from './PaginationFooter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CallLogsView({ sessions = [], onSelectSession }) {
  const [callEdits, setCallEdits] = useState({}); // callId -> { duration, timestamp }
  const [audioOverrides, setAudioOverrides] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [exportFormat, setExportFormat] = useState('CSV');
  const [activeAudioCall, setActiveAudioCall] = useState(null);
  const [uploadTargetCall, setUploadTargetCall] = useState(null); // Selected call for audio upload

  // Per-call duration edit modal state
  const [editingCall, setEditingCall] = useState(null);
  const [editDuration, setEditDuration] = useState('');
  const [editTimestamp, setEditTimestamp] = useState(''); // datetime-local value
  const [initialTimestamp, setInitialTimestamp] = useState('');
  const [editAudioMode, setEditAudioMode] = useState('file'); // 'file' | 'url'
  const [editAudioFile, setEditAudioFile] = useState(null);
  const [editAudioUrl, setEditAudioUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Audio Upload Modal state
  const [audioInputType, setAudioInputType] = useState('file'); // 'file' or 'url'
  const [customAudioUrl, setCustomAudioUrl] = useState('');

  // Map real-time sessions from backend API into call log entries
  const liveCallLogs = useMemo(() => {
    return (sessions || []).map((session, index) => {
      const isCallClick =
        session.events?.some((e) => e.name === 'CALL_BUTTON_CLICK' || e.name === 'PHONE_CALL_INITIATED') ||
        session.queryType?.toLowerCase().includes('call');

      const channel = session.trafficSource && session.adPlatform
        ? `${session.trafficSource} - ${session.adPlatform}`
        : (session.trafficSource || 'Unknown Inbound');

      const callId = session.id?.startsWith('CALL-')
        ? session.id
        : `CALL-${(session.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase() || (98200 - index)}`;

      const savedMeta = session.rawSession?.metadata || session.metadata || {};
      // No fake fallback recording: null means "no audio", and the table already
      // renders that correctly as "No Audio" + an Attach button.
      const audioUrl = audioOverrides[callId] || audioOverrides[session.id] || savedMeta.recordingUrl || null;

      return {
        id: callId,
        sessionId: session.id,
        caller: session.mobile || null,
        customerName: session.customerName || 'Unknown Caller',
        userId: session.referenceId || `REF-${(session.id || '').substring(0, 6).toUpperCase()}`,
        // No fake duration: null means "not recorded yet" until an admin fills it in via Edit.
        duration: session.rawSession?.metadata?.callDuration || session.metadata?.callDuration || null,
        status: 'Completed',
        source: isCallClick ? `${channel} (Click-to-Call)` : channel,
        landingPage: session.landingPage || null,
        timestamp: savedMeta.callTimestamp || session.timestamp || 'Just now',
        recordingUrl: audioUrl,
        isLive: true,
        isCallClick,
        rawSession: session,
      };
    });
  }, [sessions, audioOverrides]);

  // Real sessions only - no mock/demo call logs mixed in.
  const allCallLogs = useMemo(() => {
    return liveCallLogs.map((call) => ({
      ...call,
      ...callEdits[call.id],
      recordingUrl: audioOverrides[call.id] || call.recordingUrl,
    }));
  }, [liveCallLogs, callEdits, audioOverrides]);

  // Filter calls by search query and channel
  const filteredCalls = useMemo(() => {
    return allCallLogs.filter((call) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        call.caller?.toLowerCase().includes(q) ||
        call.customerName?.toLowerCase().includes(q) ||
        call.id?.toLowerCase().includes(q) ||
        call.userId?.toLowerCase().includes(q) ||
        call.source?.toLowerCase().includes(q);

      const matchesChannel =
        selectedChannel === 'ALL' ||
        (selectedChannel === 'LIVE' && call.isLive) ||
        (call.source && call.source.toLowerCase().includes(selectedChannel.toLowerCase()));

      return matchesSearch && matchesChannel;
    });
  }, [allCallLogs, searchQuery, selectedChannel]);

  // Reset page to 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedChannel]);

  // Pagination calculation
  const totalItems = filteredCalls.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentCalls = filteredCalls.slice(startIndex, endIndex);

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      exportCallLogsToCSV(filteredCalls);
    } else if (exportFormat === 'JSON') {
      exportSessionsToJSON(filteredCalls, `Inbound_Call_Logs_${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportFormat === 'PDF') {
      printExecutiveAuditReport();
    }
  };

  // Date -> value for <input type="datetime-local"> (local time, no seconds)
  const toDateTimeLocal = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatCallTimestamp = (value) =>
    new Date(value).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const openEditCall = (call) => {
    // Relative labels like "10 mins ago" can't be parsed, so fall back to the session's createdAt
    const ts = toDateTimeLocal(new Date(call.timestamp)) || toDateTimeLocal(new Date(call.rawSession?.createdAt));
    setEditingCall(call);
    setEditDuration(call.duration || '');
    setEditTimestamp(ts);
    setInitialTimestamp(ts);
    setEditAudioMode('file');
    setEditAudioFile(null);
    setEditAudioUrl('');
    setEditError('');
  };

  const closeEditCall = () => {
    setEditingCall(null);
    setEditError('');
  };

  // Save duration, timestamp and recording of one specific call (persisted to the backend for live calls)
  const handleSaveCallEdit = async (e) => {
    e.preventDefault();
    const duration = editDuration.trim();
    if (!duration || !editingCall) return;

    setIsSavingEdit(true);
    setEditError('');

    try {
      // 1. Upload a new recording file, or use the pasted link
      let recordingUrl = null;
      if (editAudioMode === 'file' && editAudioFile) {
        const up = await fetch(`${API_BASE}/uploads/recording`, {
          method: 'POST',
          headers: { 'Content-Type': editAudioFile.type || 'audio/mpeg' },
          body: editAudioFile,
        });
        const upData = await up.json();
        if (!upData.success) throw new Error(upData.message || 'Recording upload failed');
        recordingUrl = upData.url;
      } else if (editAudioMode === 'url' && editAudioUrl.trim()) {
        recordingUrl = editAudioUrl.trim();
      }

      // 2. Only send the timestamp if it was actually changed
      const timestampChanged = editTimestamp && editTimestamp !== initialTimestamp;
      const timestamp = timestampChanged ? formatCallTimestamp(editTimestamp) : null;

      // 3. Persist on the session (POSTing an existing sessionId merges metadata into it).
      // Use the true backend values here, not the dashboard's display fallbacks
      // ("Unknown" etc.) - otherwise saving an edit would overwrite real fields
      // that just happen to be missing with that placeholder text.
      if (editingCall.sessionId) {
        const rawBackendSession = editingCall.rawSession?.rawSession;
        const metadata = { callDuration: duration };
        if (timestamp) metadata.callTimestamp = timestamp;
        if (recordingUrl) metadata.recordingUrl = recordingUrl;

        const res = await fetch(`${API_BASE}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: editingCall.sessionId,
            landingPage: rawBackendSession?.landingPage,
            ipAddress: rawBackendSession?.ipAddress,
            metadata,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Save failed');
      }

      // 4. Reflect immediately in the table (backend polling keeps it in sync afterwards)
      setCallEdits((prev) => ({
        ...prev,
        [editingCall.id]: { duration, ...(timestamp ? { timestamp } : {}) },
      }));
      if (recordingUrl) {
        setAudioOverrides((prev) => ({ ...prev, [editingCall.id]: recordingUrl }));
      }
      closeEditCall();
    } catch (err) {
      setEditError(`Could not save: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle local MP3 file upload
  const handleFileUpload = (e, callId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setAudioOverrides((prev) => ({ ...prev, [callId]: dataUrl }));
      setUploadTargetCall(null);
      setCustomAudioUrl('');
    };
    reader.readAsDataURL(file);
  };

  // Handle manual URL attachment
  const handleUrlAttach = (callId) => {
    if (!customAudioUrl) return;
    setAudioOverrides((prev) => ({ ...prev, [callId]: customAudioUrl }));
    setUploadTargetCall(null);
    setCustomAudioUrl('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="search-toolbar" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Inbound Phone Call Logs
              </h3>
              {liveCallLogs.length > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                  {liveCallLogs.length} Live Synced
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total Phone Calls Tracked: <strong>{filteredCalls.length}</strong> {searchQuery && `(filtered from ${allCallLogs.length})`}
            </span>
          </div>

          {/* Actions: Add Call Log Button & Export Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
              <Download size={14} /> Export Call Logs ({filteredCalls.length})
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', margin: '14px 0 16px' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '380px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by phone, name, channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Channels' },
              { id: 'LIVE', label: '🔴 Live Incoming' },
              { id: 'TikTok', label: '🎵 TikTok Ads' },
              { id: 'Google', label: 'Google Ads' },
              { id: 'Facebook', label: 'Facebook Ads' },
              { id: 'Instagram', label: '📸 Instagram' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedChannel(btn.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: selectedChannel === btn.id ? '#2563eb' : '#e2e8f0',
                  backgroundColor: selectedChannel === btn.id ? '#eff6ff' : '#ffffff',
                  color: selectedChannel === btn.id ? '#1d4ed8' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: selectedChannel === btn.id ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Call ID</th>
                <th>Caller Phone Number</th>
                <th>Session Reference</th>
                <th>Call Duration</th>
                <th>Traffic Channel</th>
                <th>Timestamp</th>
                <th>Audio Recording</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No matching phone calls found. Submit a quote or click "Call Now" on the tracking website to generate a call!
                  </td>
                </tr>
              ) : (
                currentCalls.map((call) => (
                  <tr key={call.id} style={{ backgroundColor: call.isCallClick ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ fontWeight: 600, color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{call.id}</span>
                        {call.isLive && (
                          <span
                            title="Live synced from visitor session"
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                            }}
                          >
                            LIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#2563eb" />
                        <span style={!call.caller ? { color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 } : undefined}>
                          {call.caller || 'Not Provided'}
                        </span>
                      </div>
                      {call.customerName && (
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginTop: '2px' }}>
                          {call.customerName}
                        </span>
                      )}
                    </td>
                    <td>
                      {call.rawSession && onSelectSession ? (
                        <button
                          onClick={() => onSelectSession(call.rawSession)}
                          className="user-id-green"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            font: 'inherit',
                          }}
                          title="Click to view full session telemetry"
                        >
                          {call.userId}
                        </button>
                      ) : (
                        <span className="user-id-green">{call.userId}</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: call.duration ? '#16a34a' : '#94a3b8' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {call.duration ? call.duration : <span style={{ fontStyle: 'italic', fontWeight: 500 }}>Not Recorded</span>}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: call.isCallClick ? '#dbeafe' : '#f1f5f9',
                          color: call.isCallClick ? '#1e40af' : '#334155',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        {call.source}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {call.timestamp || 'Just now'}
                    </td>
                    <td>
                      {call.recordingUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => setActiveAudioCall(call)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              borderColor: '#bbf7d0',
                              fontWeight: 600,
                            }}
                          >
                            <Play size={12} fill="#166534" /> Play Recording
                          </button>
                          <button
                            onClick={() => setUploadTargetCall(call)}
                            title="Re-upload or change audio file"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                          >
                            <Upload size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No Audio
                          </span>
                          <button
                            className="btn-secondary"
                            onClick={() => setUploadTargetCall(call)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#ffffff',
                              color: '#2563eb',
                              borderColor: '#cbd5e1',
                              fontWeight: 600,
                            }}
                          >
                            <Upload size={12} /> Attach MP3
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => openEditCall(call)}
                        title={`Edit duration, timestamp and recording for ${call.caller}`}
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
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Audio Recording Playback Modal */}
      {activeAudioCall && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Call Recording Player
                </h3>
              </div>
              <button
                onClick={() => setActiveAudioCall(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                <strong>Caller:</strong> {activeAudioCall.caller} ({activeAudioCall.customerName || 'Customer'})
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                <strong>Call ID:</strong> {activeAudioCall.id} | <strong>Duration:</strong> {activeAudioCall.duration}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                <strong>Channel:</strong> {activeAudioCall.source}
              </div>
            </div>

            <audio controls autoPlay style={{ width: '100%', outline: 'none' }}>
              <source src={activeAudioCall.recordingUrl} type="audio/ogg" />
              <source src={activeAudioCall.recordingUrl} type="audio/mp3" />
              <source src={activeAudioCall.recordingUrl} type="audio/wav" />
              Your browser does not support audio playback.
            </audio>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                className="btn-secondary"
                onClick={() => setActiveAudioCall(null)}
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach / Upload Audio Modal for Specific Customer (e.g., Jonathan) */}
      {uploadTargetCall && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '460px', borderRadius: '12px' }}>
            <div className="modal-header" style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileAudio size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Attach Audio Recording
                </h3>
              </div>
              <button onClick={() => setUploadTargetCall(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.88rem', color: '#334155', backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                Target Call: <strong>{uploadTargetCall.caller}</strong> ({uploadTargetCall.customerName || 'Customer'})
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => setAudioInputType('file')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: audioInputType === 'file' ? '#2563eb' : '#ffffff',
                    color: audioInputType === 'file' ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  📁 Upload Local MP3/WAV File
                </button>
                <button
                  type="button"
                  onClick={() => setAudioInputType('url')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: audioInputType === 'url' ? '#2563eb' : '#ffffff',
                    color: audioInputType === 'url' ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  🔗 Paste Audio Web URL
                </button>
              </div>

              {audioInputType === 'file' ? (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Select Audio File from Laptop / Device
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, uploadTargetCall.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Supports .mp3, .wav, .ogg, .m4a audio files.
                  </span>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Audio Recording Web Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/recording.mp3"
                    value={customAudioUrl}
                    onChange={(e) => setCustomAudioUrl(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleUrlAttach(uploadTargetCall.id)}
                    style={{ width: '100%', marginTop: '10px', padding: '8px' }}
                  >
                    Save Audio Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Call Modal (opens for one specific call) */}
      {editingCall && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '460px', maxHeight: '92vh', overflowY: 'auto', borderRadius: '12px' }}>
            <div className="modal-header" style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                📞 Edit Call — {editingCall.id}
              </h3>
              <button onClick={closeEditCall} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveCallEdit}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Caller Phone Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingCall.caller || ''}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.88rem', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600, cursor: 'not-allowed' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Customer / Lead Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingCall.customerName || ''}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.88rem', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600, cursor: 'not-allowed' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Call Duration
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. 04:12 or 4m 12s"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #2563eb', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Timestamp
                  </label>
                  <input
                    type="datetime-local"
                    value={editTimestamp}
                    onChange={(e) => setEditTimestamp(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #2563eb', fontSize: '0.88rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Currently: {editingCall.timestamp || 'Just now'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Audio Recording (optional)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {[
                      { id: 'file', label: '📁 Upload File' },
                      { id: 'url', label: '🔗 Paste Link' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEditAudioMode(opt.id)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: editAudioMode === opt.id ? '#2563eb' : '#ffffff',
                          color: editAudioMode === opt.id ? '#ffffff' : '#0f172a',
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {editAudioMode === 'file' ? (
                    <>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setEditAudioFile(e.target.files[0] || null)}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        .mp3, .wav, .ogg, .m4a, .aac or .webm, up to 50 MB. Leave empty to keep the current recording.
                      </span>
                    </>
                  ) : (
                    <input
                      type="text"
                      placeholder="https://example.com/recording.mp3"
                      value={editAudioUrl}
                      onChange={(e) => setEditAudioUrl(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  )}
                </div>

                {editError && (
                  <div style={{ fontSize: '0.82rem', color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '8px 12px' }}>
                    {editError}
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={closeEditCall}>
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


