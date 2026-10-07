import React from 'react';
import { X, Clock, MapPin, Monitor, Globe, Tag, User, Mail, Phone, MessageSquare } from 'lucide-react';

export default function SessionModal({ session, onClose }) {
  if (!session) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
              Complete Captured Frontend Entry
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <span className="user-id-green" style={{ fontSize: '1.1rem' }}>
                {session.id}
              </span>
              {session.referenceId && (
                <span style={{ fontSize: '0.85rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca', fontWeight: 700, fontFamily: 'monospace' }}>
                  #{session.referenceId}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Customer Contact Details Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <User size={16} color="#2563eb" /> Customer & Lead Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Customer Name</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{session.customerName}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Email Address</span>
                <strong style={{ fontSize: '0.95rem', color: '#2563eb' }}>{session.customerEmail}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Mobile Number</span>
                <strong style={{ fontSize: '0.95rem', color: '#15803d', fontFamily: 'monospace' }}>{session.mobile}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Quotation Source</span>
                <span style={{ display: 'inline-block', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>
                  Click to Call
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Website & Device Telemetry Grid */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <Globe size={16} color="#059669" /> Website Source & Technical Telemetry
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Captured Website Origin</span>
                <a
                  href={session.landingPage}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.88rem', color: '#2563eb', fontWeight: 700, wordBreak: 'break-all' }}
                >
                  {session.landingPage}
                </a>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Client IP Address</span>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', fontFamily: 'monospace' }}>{session.ip}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Device & OS</span>
                <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                  {session.device} ({session.os})
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Browser Agent</span>
                <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                  {session.browser}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Traffic Source</span>
                <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                  {session.trafficSource}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Captured Timestamp</span>
                <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                  {session.timestamp}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn-primary" onClick={onClose}>
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
