import {
  PhoneCall,
  Radio,
  BarChart3,
  ShieldCheck,
  Download,
  Palette,
  ArrowRight,
  CheckCircle2,
  Lock,
  Server,
  Globe2,
  Mail,
} from 'lucide-react';

const SUPPORT_EMAIL = 'support@trackinbound.com';

// Opens Gmail's own compose window (in a new tab) with the recipient,
// subject and body pre-filled - works for anyone with a Gmail account open
// in the browser, unlike a plain mailto: link which depends on the visitor
// having a desktop email client configured.
function buildGmailComposeUrl({ to, subject = '', body = '' }) {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

const FEATURES = [
  {
    icon: Radio,
    title: 'Live Visitor Telemetry',
    desc: 'Every page visit and form submission streams into your dashboard in real time, no page refresh required.',
  },
  {
    icon: PhoneCall,
    title: 'Call Recording & Duration',
    desc: 'Every inbound call is logged with duration and a recording slot, so you always know what happened after the click.',
  },
  {
    icon: BarChart3,
    title: 'Multi-Platform Attribution',
    desc: 'Automatic traffic-source detection across Google, Facebook, TikTok and Instagram - matched straight to ad spend.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Admin Access',
    desc: 'Invite teammates or partners with scoped logins - each one only ever sees the website(s) you assign them.',
  },
  {
    icon: Download,
    title: 'One-Click Reporting',
    desc: 'Export any view to CSV, JSON or a print-ready PDF audit report whenever a client or partner asks for proof.',
  },
  {
    icon: Palette,
    title: 'White-Label Ready',
    desc: 'Agencies can rebrand the dashboard with their own name and logo for every client they onboard.',
  },
];

const STEPS = [
  {
    title: 'Drop in one script tag',
    desc: 'Add a single tracking snippet to any landing page - no backend work, no SDKs to install.',
  },
  {
    title: 'Visitors call or submit a form',
    desc: 'Every click-to-call and form conversion is captured automatically, with full device and source telemetry.',
  },
  {
    title: 'Watch it live in your dashboard',
    desc: 'Calls, leads and ad spend all land in one place - searchable, exportable, and updated every few seconds.',
  },
];

const PRICING_FEATURES = [
  'Unlimited tracked websites',
  'Real-time call & lead telemetry',
  'Google / Facebook / TikTok / Instagram attribution',
  'Unlimited scoped admin logins',
  'CSV, JSON & PDF exports',
  'White-label branding',
  'Priority email support',
];

const FAQS = [
  {
    q: 'How long does setup take?',
    a: 'Most teams are live within a day - it is a single script tag on your existing landing pages, nothing to rebuild.',
  },
  {
    q: 'Can I give my team or clients their own logins?',
    a: 'Yes. Every plan includes unlimited scoped admin accounts, each restricted to only the website(s) you choose.',
  },
  {
    q: 'Do you offer white-labeling for agencies?',
    a: 'Yes - agencies can show each client their own brand name and logo inside the same dashboard.',
  },
  {
    q: 'Does this work alongside my existing CRM?',
    a: 'Yes - Track Inbound sits on top of your landing pages and exports cleanly to CSV or JSON, so it slots in next to whatever you already use.',
  },
];

const INTEGRATIONS = [
  { name: 'Google Ads', color: '#2563eb' },
  { name: 'Meta Ads', color: '#9333ea' },
  { name: 'TikTok Ads', color: '#f43f5e' },
  { name: 'Instagram', color: '#f59e0b' },
];

const PREVIEW_ROWS = [
  { name: 'Morgan Lee', sub: 'Click-to-Call', chan: 'Google Ads', dur: '04:12' },
  { name: 'Alex Rivera', sub: 'Quote Request', chan: 'Meta Ads', dur: '02:48' },
  { name: 'Jordan Davis', sub: 'Click-to-Call', chan: 'TikTok Ads', dur: '07:03' },
];

function MarketingSite() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <img src="/logo.png" alt="Track Inbound" />
            <span>Track Inbound</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <a href="#pricing" className="btn btn-primary">
            Get Started <ArrowRight size={15} />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">
              <Radio size={13} /> Real-time inbound tracking
            </span>
            <h1>
              Know exactly where every <span>call and lead</span> came from.
            </h1>
            <p className="lead">
              Track Inbound unifies your form leads, click-to-call conversions and ad spend into
              one live dashboard - so you stop guessing which platform is actually working.
            </p>
            <div className="hero-ctas">
              <a href="#pricing" className="btn btn-primary btn-lg">
                Start Tracking Today <ArrowRight size={16} />
              </a>
              <a href="#how-it-works" className="btn btn-ghost btn-lg">
                See How It Works
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <strong>&lt; 5 min</strong>
                <span>Setup time</span>
              </div>
              <div>
                <strong>4 platforms</strong>
                <span>Ad attribution</span>
              </div>
              <div>
                <strong>Real-time</strong>
                <span>Live telemetry</span>
              </div>
            </div>
          </div>

          <div className="mock-card">
            <div className="mock-topbar">
              <span className="mock-dot"></span>
              <span className="mock-dot"></span>
              <span className="mock-dot"></span>
            </div>
            <div className="mock-row">
              <div className="left">
                <span className="mock-pulse"></span>
                <div>
                  <div className="label">Inbound call connected</div>
                  <div className="sub">Click-to-Call &middot; 2s ago</div>
                </div>
              </div>
              <span className="mock-tag tag-google">Google</span>
            </div>
            <div className="mock-row">
              <div className="left">
                <span className="mock-pulse"></span>
                <div>
                  <div className="label">Form lead captured</div>
                  <div className="sub">Quote Request &middot; 14s ago</div>
                </div>
              </div>
              <span className="mock-tag tag-fb">Facebook</span>
            </div>
            <div className="mock-row">
              <div className="left">
                <span className="mock-pulse"></span>
                <div>
                  <div className="label">New visitor session</div>
                  <div className="sub">Landing page &middot; 29s ago</div>
                </div>
              </div>
              <span className="mock-tag tag-tiktok">TikTok</span>
            </div>
            <div className="mock-stats">
              <div className="mock-stat">
                <strong>128</strong>
                <span>Calls</span>
              </div>
              <div className="mock-stat">
                <strong>342</strong>
                <span>Leads</span>
              </div>
              <div className="mock-stat">
                <strong>$6.1k</strong>
                <span>Tracked Spend</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item">
            <Lock size={15} color="#15803d" /> Bank-level data encryption
          </div>
          <div className="trust-item">
            <Server size={15} color="#15803d" /> 99.9% tracking uptime
          </div>
          <div className="trust-item">
            <Globe2 size={15} color="#15803d" /> Works on any website
          </div>
          <div className="trust-item">
            <ShieldCheck size={15} color="#15803d" /> Role-based data access
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="integrations">
        <div className="integrations-label">Works with the ad platforms you already run</div>
        <div className="integrations-row">
          {INTEGRATIONS.map((i) => (
            <span className="integration-badge" key={i.name}>
              <span className="integration-dot" style={{ backgroundColor: i.color }}></span>
              {i.name}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-head">
          <span className="section-tag">Platform</span>
          <h2>Everything your team needs in one dashboard</h2>
          <p>From the first visitor click to the closed call, every signal lands in one place.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">
                  <Icon size={22} color="#15803d" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="preview-section">
        <div className="section-head">
          <span className="section-tag">See it in action</span>
          <h2>This is the exact dashboard you'll be using</h2>
          <p>Every call, every lead and every dollar of ad spend - laid out the moment it happens.</p>
        </div>
        <div className="preview-shell">
          <div className="preview-chrome">
            <span className="mock-dot"></span>
            <span className="mock-dot"></span>
            <span className="mock-dot"></span>
            <span className="preview-url">app.trackinbound.com/call-logs</span>
          </div>
          <div className="preview-body">
            <div className="preview-nav">
              <span className="preview-nav-item">Dashboard</span>
              <span className="preview-nav-item">Reports</span>
              <span className="preview-nav-item">Sessions</span>
              <span className="preview-nav-item active">Call Logs</span>
              <span className="preview-nav-item">Leads</span>
              <span className="preview-nav-item">Analytics</span>
            </div>
            <div className="preview-main">
              <div className="preview-main-head">
                <h4>Inbound Phone Call Logs</h4>
                <span className="preview-live-pill">&bull; Live Synced</span>
              </div>
              <div className="preview-kpis">
                <div className="preview-kpi">
                  <span>Calls Today</span>
                  <strong>47</strong>
                </div>
                <div className="preview-kpi">
                  <span>Avg Duration</span>
                  <strong>04:36</strong>
                </div>
                <div className="preview-kpi">
                  <span>Tracked Spend</span>
                  <strong>$2,140</strong>
                </div>
              </div>
              {PREVIEW_ROWS.map((r) => (
                <div className="preview-table-row" key={r.name}>
                  <div>
                    <div className="name">{r.name}</div>
                    <div className="sub">{r.sub}</div>
                  </div>
                  <div className="chan">{r.chan}</div>
                  <div className="dur">{r.dur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works" style={{ background: '#ffffff' }}>
        <div className="section-head">
          <span className="section-tag">How it works</span>
          <h2>Live in minutes, not sprints</h2>
          <p>No developers needed on an ongoing basis - install once, then just watch the data arrive.</p>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step" key={s.title}>
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="section pricing-section" id="pricing">
        <div className="section-head">
          <span className="section-tag" style={{ color: '#4ade80' }}>Pricing</span>
          <h2>One plan. Everything included.</h2>
          <p>No per-seat fees, no hidden add-ons for the features that matter.</p>
        </div>

        <div className="pricing-card">
          <span className="pricing-badge">Most Popular</span>
          <h3>Track Inbound Pro</h3>
          <div className="price-row">
            <strong>$299</strong>
            <span> / month</span>
          </div>
          <ul className="pricing-list">
            {PRICING_FEATURES.map((f) => (
              <li key={f}>
                <CheckCircle2 size={17} color="#16a34a" /> {f}
              </li>
            ))}
          </ul>
          <a
            href={buildGmailComposeUrl({ to: 'sales@trackinbound.com', subject: 'Get Started with Track Inbound' })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Start Tracking Today <ArrowRight size={15} />
          </a>
          <p className="pricing-note">Cancel anytime. No setup fees.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq" style={{ background: '#ffffff' }}>
        <div className="section-head">
          <span className="section-tag">FAQ</span>
          <h2>Questions, answered</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <div className="faq-item" key={item.q}>
              <h4>{item.q}</h4>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <div className="cta-band">
        <div>
          <h3>Ready to see where your calls really come from?</h3>
          <p>Set up takes minutes. Cancel any time.</p>
        </div>
        <a href="#pricing" className="btn btn-primary btn-lg">
          Start Tracking Today <ArrowRight size={16} />
        </a>
      </div>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/logo.png" alt="Track Inbound" />
              <span>Track Inbound</span>
            </div>
            <p className="footer-blurb">
              A single real-time dashboard for every inbound call, form lead and ad dollar -
              built for marketing teams who need proof, not guesswork.
            </p>
            <div className="footer-social">
              <a
                href={buildGmailComposeUrl({ to: SUPPORT_EMAIL })}
                target="_blank"
                rel="noopener noreferrer"
                title="Email us on Gmail"
                className="footer-email-link"
              >
                <span className="footer-email-icon">
                  <Mail size={16} />
                </span>
                <span className="footer-email-text">{SUPPORT_EMAIL}</span>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href={buildGmailComposeUrl({ to: 'sales@trackinbound.com' })} target="_blank" rel="noopener noreferrer">Contact Sales</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="#how-it-works">Getting Started</a></li>
              <li><a href="#faq">Support</a></li>
              <li><a href={buildGmailComposeUrl({ to: 'sales@trackinbound.com', subject: 'Request a Demo' })} target="_blank" rel="noopener noreferrer">Request a Demo</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">&copy; {new Date().getFullYear()} Track Inbound. All rights reserved.</span>
          <div className="footer-legal">
            <a href="#faq">Privacy Policy</a>
            <a href="#faq">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default MarketingSite;
