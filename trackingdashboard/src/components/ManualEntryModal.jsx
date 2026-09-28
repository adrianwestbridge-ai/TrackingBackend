import React, { useState } from 'react';
import { X, PlusCircle, User, Mail, Phone, Globe, FileText, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ManualEntryModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    mobile: '',
    queryType: 'General Inquiry',
    feedbackMessage: '',
    trafficSource: 'Google',
    device: 'Desktop',
    os: 'Windows 11',
    browser: 'Chrome',
    location: 'United States',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const sessionId = `sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    
    const payload = {
      sessionId,
      // Honest labels: this lead was typed in by an admin, not captured from a real
      // page visit, so there genuinely is no landing page URL or IP address to record.
      landingPage: 'Manual Entry (no page visit)',
      ipAddress: null,
      device: formData.device,
      os: formData.os,
      browser: formData.browser,
      trafficSource: formData.trafficSource,
      adPlatform: formData.trafficSource === 'Google' ? 'Google Ads' : (formData.trafficSource === 'Facebook' || formData.trafficSource === 'Instagram') ? 'Meta Ads' : formData.trafficSource === 'TikTok' ? 'TikTok Ads' : 'Organic',
      metadata: {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        fullMobileNumber: formData.mobile,
        queryType: formData.queryType,
        feedbackMessage: formData.feedbackMessage || 'Manually logged from dashboard',
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      events: [
        { name: 'MANUAL_DASHBOARD_ENTRY', timestamp: new Date() }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          onRefresh && onRefresh();
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create manual lead entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '12px' }}>
        <div className="modal-header" style={{ padding: '18px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add Manual Telemetry Record</h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {successMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Saved to MongoDB Successfully!
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Customer / Lead Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7253354235"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Traffic Channel
                </label>
                <select
                  value={formData.trafficSource}
                  onChange={(e) => setFormData({ ...formData, trafficSource: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="TikTok">TikTok Ads</option>
                  <option value="Google">Google Ads</option>
                  <option value="Facebook">Facebook Ads</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Query Category
                </label>
                <select
                  value={formData.queryType}
                  onChange={(e) => setFormData({ ...formData, queryType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Auto Insurance Quote">Auto Insurance Quote</option>
                  <option value="Coverage Upgrade">Coverage Upgrade</option>
                  <option value="Policy Claims">Policy Claims</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Message / Notes
              </label>
              <textarea
                rows="2"
                placeholder="Optional customer notes..."
                value={formData.feedbackMessage}
                onChange={(e) => setFormData({ ...formData, feedbackMessage: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              {isSubmitting ? 'Saving to MongoDB...' : 'Save Manual Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
