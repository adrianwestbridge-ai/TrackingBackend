import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Lets a super admin create a scoped admin - one who can only ever see data
// for the specific website(s) checked below. That restriction is enforced on
// the backend (see TrackingBackend/controllers/sessionController.js), not
// just hidden in this UI - a scoped admin's login token itself only carries
// the websites they're allowed to see.
export default function CreateAdminModal({ isOpen, onClose, authToken, knownWebsites, existingAdmins, onAdminCreated, onAdminDeleted }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOrigins, setSelectedOrigins] = useState([]);
  const [customOrigin, setCustomOrigin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        body: JSON.stringify({ username, password, allowedOrigins: selectedOrigins }),
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

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '18px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Scoped Admin</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '65vh', overflowY: 'auto' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              This admin will only ever see data for the website(s) checked below - not "All Websites",
              and not any other site. This is enforced by the backend, not just hidden in the UI.
            </p>

            {successMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem' }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. drivecoverage_admin"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Website(s) this admin may access
              </label>
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

            {existingAdmins.length > 0 && (
              <div style={{ marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Existing admins
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {existingAdmins.map((a) => (
                    <div
                      key={a.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    >
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{a.username}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '8px' }}>
                          {a.role === 'superadmin' ? 'Super Admin (all websites)' : a.allowedOrigins.join(', ')}
                        </span>
                      </div>
                      {a.role !== 'superadmin' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(a)}
                          title="Delete this admin"
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#b91c1c' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
