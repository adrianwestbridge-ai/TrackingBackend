import React, { useState } from 'react';
import { Code, Copy, Check, Shield, Globe, Bell, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const [copied, setCopied] = useState(false);
  const snippet = `<script>
  (function(t,r,a,c,k){
    t['TrackingObject']=a;t[a]=t[a]||function(){(t[a].q=t[a].q||[]).push(arguments)};
    t[a].l=1*new Date();k=r.createElement('script');c=r.getElementsByTagName('script')[0];
    k.async=1;k.src='https://cdn.trackingsystem.io/pixel.js';k.setAttribute('data-account','TS-98241');
    c.parentNode.insertBefore(k,c);
  })(window,document,'track');
  track('init', 'TS-98241');
  track('pageview');
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tracking Pixel Setup Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Code size={22} color="#2563eb" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tracking Pixel Setup Code</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
          Paste this tracking script into the <code>&lt;head&gt;</code> tag of your landing pages to start capturing live visitor IDs and URLs automatically.
        </p>

        <div style={{ position: 'relative' }}>
          <pre
            style={{
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              overflowX: 'auto',
              lineHeight: '1.6',
            }}
          >
            {snippet}
          </pre>

          <button
            className="btn-primary"
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 12px',
              fontSize: '0.78rem',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Domain Whitelist Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#16a34a" /> Authorized Tracking Domains
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}>
          {['https://pestcontrolprousa.com/', 'https://pestcontrolprousa.org/', 'https://pestcontactprousa.com/'].map((domain, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>{domain}</span>
              <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={12} /> Active & Verified
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
