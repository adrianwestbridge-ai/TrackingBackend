import React, { useState } from 'react';
import { X, Users, UserPlus, CheckCircle2, AlertCircle, Trash2, Pencil, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 };
const cardHeader = {
  padding: '12px 16px',
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 700,
  fontSize: '0.88rem',
  color: '#0f172a',
};
const cardBody = { padding: '16px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' };
const labelStyle = { fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' };

const initials = (name) => (name || '?').slice(0, 2).toUpperCase();

// Lets a super admin create a scoped admin - one who can only ever see data
// for the specific website(s) checked below. That restriction is enforced on
// the backend (see TrackingBackend/controllers/sessionController.js), not
// just hidden in this UI - a scoped admin's login token itself only carries
// the websites they're allowed to see.
export default function CreateAdminModal({ isOpen, onClose, authToken, knownWebsites, existingAdmins, onAdminCreated, onAdminUpdated, onAdminDeleted }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [customOrigin, setCustomOrigin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline "edit website access" panel for an existing admin
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editOrigins, setEditOrigins] = useState([]);
  const [editCustomOrigin, setEditCustomOrigin] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  if (!isOpen) return null;

  const toggleOrigin = (origin) => {
    setSelectedOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
  };

  const addCustomOrigin = () => {
    const trimmed = customOrigin.trim().replace(/\/$/, '');
    if (trimmed && !selectedOrigins.includes(trimmed)) {
      setSelectedOrigins((prev) => [...prev, trimmed]);
    }
    setCustomOrigin('');
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setBrandName('');
    setSelectedOrigins([]);
    setCustomOrigin('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (selectedOrigins.length === 0) {
      setError('Select at least one website this admin may access.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ username, password, allowedOrigins: selectedOrigins, brandName }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Could not create admin');
        setIsSubmitting(false);
        return;
      }
      setSuccessMsg(`Admin "${data.data.username}" created.`);
      resetForm();
      onAdminCreated && onAdminCreated(data.data);
    } catch (err) {
      setError('Could not reach the backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (admin) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admins/${admin.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        onAdminDeleted && onAdminDeleted(admin.id);
      }
    } catch (err) {
      // silently ignore - the list will just not update
    }
  };

  const openEditAdmin = (admin) => {
    setEditingAdminId(admin.id);
    setEditOrigins([...admin.allowedOrigins]);
    setEditCustomOrigin('');
    setEditError('');
  };

  const closeEditAdmin = () => {
    setEditingAdminId(null);
    setEditError('');
  };

  const toggleEditOrigin = (origin) => {
    setEditOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
  };

  const addEditCustomOrigin = () => {
    const trimmed = editCustomOrigin.trim().replace(/\/$/, '');
    if (trimmed && !editOrigins.includes(trimmed)) {
      setEditOrigins((prev) => [...prev, trimmed]);
    }
    setEditCustomOrigin('');
  };

  const handleSaveEdit = async (admin) => {
    setEditError('');
    if (editOrigins.length === 0) {
      setEditError('Select at least one website this admin may access.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ allowedOrigins: editOrigins }),
      });
      const data = await res.json();
      if (!data.success) {
        setEditError(data.message || 'Could not update admin');
        setIsSavingEdit(false);
        return;
      }
      onAdminUpdated && onAdminUpdated(data.data);
      closeEditAdmin();
    } catch (err) {
      setEditError('Could not reach the backend.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '18px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={17} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Admins</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Create new scoped admins and edit who has access to what</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '72vh', overflowY: 'auto' }}>
          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {/* ---- Existing Admins ---- */}
          <div style={card}>
            <div style={cardHeader}>
              <ShieldCheck size={16} color="#15803d" /> Existing Admins
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>
                {existingAdmins.length} total
              </span>
            </div>
            <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {existingAdmins.map((a) => (
                <div
                  key={a.id}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafbfc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: a.role === 'superadmin' ? '#7c3aed' : '#15803d',
                          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.74rem', flexShrink: 0,
                        }}
                      >
                        {initials(a.username)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{a.username}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: a.role === 'superadmin' ? 'inherit' : 'monospace' }}>
                          {a.role === 'superadmin' ? 'Super Admin · All websites' : a.allowedOrigins.join(', ')}
                        </div>
                      </div>
                    </div>
                    {a.role !== 'superadmin' && (
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => (editingAdminId === a.id ? closeEditAdmin() : openEditAdmin(a))}
                          title="Edit this admin's website access"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '30px', height: '30px', borderRadius: '7px',
                            border: '1px solid', borderColor: editingAdminId === a.id ? '#15803d' : '#dbeafe',
                            background: editingAdminId === a.id ? '#dcfce7' : '#eff6ff',
                            color: editingAdminId === a.id ? '#15803d' : '#2563eb', cursor: 'pointer',
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a)}
                          title="Delete this admin"
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '30px', height: '30px', borderRadius: '7px',
                            border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingAdminId === a.id && (
                    <div style={{ padding: '14px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                        Website access for {a.username}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {Array.from(new Set([...knownWebsites, ...a.allowedOrigins])).map((origin) => (
                          <label
                            key={origin}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0f172a', cursor: 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              checked={editOrigins.includes(origin)}
                              onChange={() => toggleEditOrigin(origin)}
                            />
                            <span style={{ fontFamily: 'monospace' }}>{origin}</span>
                          </label>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={editCustomOrigin}
                          onChange={(e) => setEditCustomOrigin(e.target.value)}
                          placeholder="https://a-new-website.com"
                          style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={addEditCustomOrigin}
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          Add
                        </button>
                      </div>

                      {editError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 10px' }}>
                          <AlertCircle size={13} /> {editError}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
                        <button type="button" className="btn-secondary" onClick={closeEditAdmin} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleSaveEdit(a)}
                          disabled={isSavingEdit}
                          style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                        >
                          {isSavingEdit ? 'Saving...' : 'Save Access'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---- Create New Admin ---- */}
          <form onSubmit={handleSubmit} style={card}>
            <div style={cardHeader}>
              <UserPlus size={16} color="#15803d" /> Create New Admin
            </div>
            <div style={{ ...cardBody, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                This admin will only ever see data for the website(s) checked below - not "All Websites",
                and not any other site. This is enforced by the backend, not just hidden in the UI.
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. drivecoverage_admin"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>White-label Brand Name (optional)</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Zing Leads"
                  style={inputStyle}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Shown instead of "Track Inbound" in this admin's own sidebar and login screen. Leave empty to keep the default.
                </span>
              </div>

              <div>
                <label style={{ ...labelStyle, marginBottom: '6px' }}>Website(s) this admin may access</label>
                {knownWebsites.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                    No websites have sent data yet - add one manually below once you know its URL.
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {knownWebsites.map((origin) => (
                    <label
                      key={origin}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrigins.includes(origin)}
                        onChange={() => toggleOrigin(origin)}
                      />
                      <span style={{ fontFamily: 'monospace' }}>{origin}</span>
                    </label>
                  ))}
                  {selectedOrigins
                    .filter((o) => !knownWebsites.includes(o))
                    .map((origin) => (
                      <label
                        key={origin}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#0f172a', cursor: 'pointer' }}
                      >
                        <input type="checkbox" checked readOnly onChange={() => toggleOrigin(origin)} />
                        <span style={{ fontFamily: 'monospace' }}>{origin}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(manually added)</span>
                      </label>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customOrigin}
                    onChange={(e) => setCustomOrigin(e.target.value)}
                    placeholder="https://a-new-website.com"
                    style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={addCustomOrigin}
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer" style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
