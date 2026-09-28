import React, { useState, useEffect } from 'react';
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  Star,
  User,
  Mail,
  MapPin,
  Lock,
  Send,
  RefreshCw,
  Check,
  Code,
  ChevronUp,
  ChevronDown,
  Zap,
  DollarSign,
  Headphones,
  Car,
  Search,
} from 'lucide-react';
import { gatherAutoTelemetry } from './utils/telemetryDetector';
import './index.css';

// Set VITE_API_URL at build/deploy time (e.g. https://tracking-api.onrender.com/api).
// Falls back to the local backend when not set, so `npm run dev` keeps working as-is.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeveloperLogs, setShowDeveloperLogs] = useState(false);

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    state: '',
  });

  // Receipt details for post-submit state
  const [submissionReceipt, setSubmissionReceipt] = useState(null);

  // Telemetry state
  const [autoTelemetry, setAutoTelemetry] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Auto detect visitor telemetry silently on page load
  useEffect(() => {
    gatherAutoTelemetry().then((telemetry) => {
      setAutoTelemetry(telemetry);
    });
  }, []);

  const handleInputChange = (e) => {
    setQuoteForm({ ...quoteForm, [e.target.name]: e.target.value });
  };

  // Submit Quote Request Form with Automatic Background Telemetry Gathering
  const handleQuoteSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    // Automatically gather fresh telemetry with a new unique Session ID for every submission
    const telemetry = await gatherAutoTelemetry(true);
    const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PST';
    const referenceId = `DC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const fullName = `${quoteForm.firstName} ${quoteForm.lastName}`.trim();

    const payload = {
      sessionId: telemetry.sessionId,
      landingPage: telemetry.landingPage,
      mobile: quoteForm.phone,
      ipAddress: telemetry.ipAddress,
      device: telemetry.device,
      os: telemetry.os,
      browser: telemetry.browser,
      trafficSource: telemetry.trafficSource,
      adPlatform: telemetry.adPlatform,
      events: [
        { name: 'LANDING_PAGE', details: { url: telemetry.landingPage } },
        {
          name: 'AUTO_QUOTE_SUBMITTED',
          details: { name: fullName, email: quoteForm.email, zip: quoteForm.zipCode, state: quoteForm.state },
        },
      ],
      metadata: {
        customerName: fullName,
        customerEmail: quoteForm.email,
        fullMobileNumber: quoteForm.phone,
        zipCode: quoteForm.zipCode,
        state: quoteForm.state,
        queryType: 'Auto Insurance Quote Request',
        feedbackMessage: `Requested vehicle insurance quote for Zip Code ${quoteForm.zipCode}, State: ${quoteForm.state}.`,
        referenceId,
        autoDetected: true,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (resData.success) {
        const savedSession = resData.data;
        setSessionData({
          landingPage: savedSession.landingPage || telemetry.landingPage,
          mobile: savedSession.mobile || quoteForm.phone,
          ipAddress: savedSession.ipAddress || telemetry.ipAddress,
          timestamp: savedSession.createdAt
            ? new Date(savedSession.createdAt).toISOString().replace('T', ' ').substring(0, 19) + ' PST'
            : nowFormatted,
          sessionId: savedSession.sessionId || telemetry.sessionId,
          device: savedSession.device || telemetry.device,
          os: savedSession.os || telemetry.os,
          browser: savedSession.browser || telemetry.browser,
          trafficSource: savedSession.trafficSource || telemetry.trafficSource,
          adPlatform: savedSession.adPlatform || telemetry.adPlatform,
          events: savedSession.events || [{ name: 'LANDING_PAGE' }, { name: 'AUTO_QUOTE_SUBMITTED' }],
        });
      } else {
        throw new Error(resData.message || 'API submit failed');
      }
    } catch (error) {
      console.warn('API Error (saving telemetry locally):', error);
      setSessionData({
        landingPage: telemetry.landingPage,
        mobile: quoteForm.phone,
        ipAddress: telemetry.ipAddress,
        timestamp: nowFormatted,
        sessionId: telemetry.sessionId,
        device: telemetry.device,
        os: telemetry.os,
        browser: telemetry.browser,
        trafficSource: telemetry.trafficSource,
        adPlatform: telemetry.adPlatform,
        events: [{ name: 'LANDING_PAGE' }, { name: 'AUTO_QUOTE_SUBMITTED' }],
      });
    } finally {
      setLoading(false);
      setSubmissionReceipt({
        referenceId,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        name: fullName,
        email: quoteForm.email,
        phone: quoteForm.phone,
        zipCode: quoteForm.zipCode,
        state: quoteForm.state,
        trafficSource: telemetry.trafficSource,
        adPlatform: telemetry.adPlatform,
      });
      setSubmitted(true);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setShowDeveloperLogs(false);
    setQuoteForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      zipCode: '',
      state: '',
    });
    gatherAutoTelemetry(true).then((telemetry) => {
      setAutoTelemetry(telemetry);
    });
  };

  const handleCallNowClick = async (e, phone = '(216) 577-4239') => {
    try {
      const telemetry = await gatherAutoTelemetry(true);
      const referenceId = `CALL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const fullName = `${quoteForm.firstName} ${quoteForm.lastName}`.trim() || null;
      // Only a real number the visitor already typed into the form - never the
      // business's own number standing in for the caller's identity.
      const callerNumber = quoteForm.phone || null;

      const payload = {
        sessionId: telemetry.sessionId,
        landingPage: telemetry.landingPage,
        mobile: callerNumber,
        ipAddress: telemetry.ipAddress,
        device: telemetry.device,
        os: telemetry.os,
        browser: telemetry.browser,
        trafficSource: telemetry.trafficSource,
        adPlatform: telemetry.adPlatform,
        events: [
          { name: 'LANDING_PAGE', details: { url: telemetry.landingPage } },
          {
            name: 'CALL_BUTTON_CLICK',
            details: { dialNumber: phone, caller: callerNumber, timestamp: new Date().toISOString() },
          },
        ],
        metadata: {
          customerName: fullName,
          customerEmail: quoteForm.email || null,
          fullMobileNumber: callerNumber,
          queryType: 'Phone Call (Click-to-Call)',
          feedbackMessage: `Visitor tapped the Call Now button to dial ${phone}. This only logs the click - the call itself happens on the visitor's phone, so duration/outcome must be entered manually once known.`,
          // No call duration here: this logs a click, not a completed call. An admin
          // fills the real duration in via the dashboard's "Edit" action once known.
          referenceId,
          autoDetected: true,
        },
      };

      await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Call telemetry track warning:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="container nav-wrapper">
          <a href="#" className="logo">
            Drive<span>Coverage</span>Now
          </a>
          <a href="tel:2165774239" className="nav-btn" onClick={(e) => handleCallNowClick(e, '(216) 577-4239')}>
            <Phone size={15} /> Call Now<span className="nav-btn-number">: (216) 577-4239</span>
          </a>
        </div>
      </header>

      {!submitted ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="container split-container">
              {/* LEFT SIDE: Content */}
              <div className="hero-content">
                <span className="badge">
                  <Star size={14} fill="#2563eb" color="#2563eb" /> #1 Rated Insurance Provider
                </span>
                <h1>
                  Protect Your Drive With <span>Smart Coverage</span>
                </h1>
                <p className="insurance-text">
                  Get personalized auto insurance quotes in minutes. We compare rates from top providers to ensure you get the best protection at the lowest price.
                  <a href="tel:2165774239" className="call-btn-inline" onClick={(e) => handleCallNowClick(e, '(216) 577-4239')}>
                    <Phone size={16} /> Call Now
                  </a>
                </p>

                <ul className="hero-checklist">
                  <li>
                    <CheckCircle2 size={18} /> Instant Quote Comparison
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Save up to 40% on Premiums
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> 24/7 Claims Support & Roadside Assistance
                  </li>
                </ul>

                <div className="stats">
                  <div className="stat-item">
                    <h4>50k+</h4>
                    <p>Happy Drivers</p>
                  </div>
                  <div className="stat-item">
                    <h4>4.9/5</h4>
                    <p>Customer Rating</p>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Quote Form */}
              <div className="hero-form-wrapper">
                <div className="form-card">
                  <div className="form-header">
                    <h3>Get Your Quote</h3>
                    <p>Fast, free & no obligation auto coverage quote</p>
                  </div>

                  <form onSubmit={handleQuoteSubmit}>
                    {/* First & Last Name */}
                    <div className="row">
                      <div className="col form-group">
                        <label>First Name</label>
                        <div className="input-wrapper">
                          <User size={16} />
                          <input
                            type="text"
                            name="firstName"
                            className="form-control"
                            placeholder="John"
                            value={quoteForm.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col form-group">
                        <label>Last Name</label>
                        <div className="input-wrapper">
                          <User size={16} />
                          <input
                            type="text"
                            name="lastName"
                            className="form-control"
                            placeholder="Doe"
                            value={quoteForm.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="input-wrapper">
                        <Mail size={16} />
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="john@example.com"
                          value={quoteForm.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="input-wrapper">
                        <Phone size={16} />
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          placeholder="(555) 123-4567"
                          value={quoteForm.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Zip Code */}
                    <div className="form-group">
                      <label>Zip Code</label>
                      <div className="input-wrapper">
                        <MapPin size={16} />
                        <input
                          type="text"
                          name="zipCode"
                          className="form-control"
                          placeholder="10001"
                          value={quoteForm.zipCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* State */}
                    <div className="form-group">
                      <label>State</label>
                      <div className="input-wrapper">
                        <MapPin size={16} />
                        <input
                          type="text"
                          name="state"
                          className="form-control"
                          placeholder="New York"
                          value={quoteForm.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? (
                        <>
                          <RefreshCw className="spin" size={18} /> Processing Quote...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Get My Free Quote
                        </>
                      )}
                    </button>

                    <div className="secure-text">
                      <Lock size={13} /> Your information is 100% secure
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works">
            <div className="container">
              <h2 className="section-title">How It Works</h2>
              <p className="section-sub">Get the best auto insurance in 3 simple steps</p>

              <div className="steps">
                <div className="step-card">
                  <div className="step-icon">
                    <User size={28} />
                  </div>
                  <h3>1. Enter Your Details</h3>
                  <p>Fill out our quick form with your basic vehicle & location info to start comparing quotes.</p>
                </div>

                <div className="step-card">
                  <div className="step-icon">
                    <Search size={28} />
                  </div>
                  <h3>2. Compare Quotes</h3>
                  <p>We instantly analyze rates from top-tier insurance carriers across the United States.</p>
                </div>

                <div className="step-card">
                  <div className="step-icon">
                    <Car size={28} />
                  </div>
                  <h3>3. Choose Best Coverage</h3>
                  <p>Select the customized policy that offers maximum drive protection at the lowest price.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Section */}
          <section className="why-us">
            <div className="container">
              <h2 className="section-title">Why Choose DriveCoverageNow</h2>
              <p className="section-sub">The smartest way to protect your vehicle and save money</p>

              <div className="features">
                <div className="feature-box">
                  <div className="feat-icon">
                    <Zap size={24} />
                  </div>
                  <h3>Instant Quotes</h3>
                  <p>Compare multiple insurance providers within seconds without waiting on hold.</p>
                </div>

                <div className="feature-box">
                  <div className="feat-icon">
                    <ShieldCheck size={24} />
                  </div>
                  <h3>Trusted Providers</h3>
                  <p>We partner with the most trusted, A-rated insurance companies in the USA.</p>
                </div>

                <div className="feature-box">
                  <div className="feat-icon">
                    <DollarSign size={24} />
                  </div>
                  <h3>Save More Money</h3>
                  <p>Drivers save up to 40% on annual premiums when comparing quotes through our platform.</p>
                </div>

                <div className="feature-box">
                  <div className="feat-icon">
                    <Headphones size={24} />
                  </div>
                  <h3>24/7 Support</h3>
                  <p>Our dedicated insurance specialists are always ready to assist you with claims or questions.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section className="reviews">
            <div className="container">
              <h2 className="section-title">What Our Drivers Say</h2>
              <p className="section-sub">Over 50,000 drivers trust DriveCoverageNow for auto protection</p>

              <div className="review-grid">
                <div className="review-card">
                  <div className="review-stars">
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <p>"Saved over $650 a year on my car insurance! The quote process took less than 2 minutes."</p>
                  <h4>David M.</h4>
                  <span>Dallas, TX</span>
                </div>

                <div className="review-card">
                  <div className="review-stars">
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <p>"Super easy to compare rates. Customer support was incredibly helpful when I had questions."</p>
                  <h4>Sarah K.</h4>
                  <span>Miami, FL</span>
                </div>

                <div className="review-card">
                  <div className="review-stars">
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  </div>
                  <p>"Found comprehensive coverage for both of my family vehicles at a fraction of what I was paying before."</p>
                  <h4>Robert T.</h4>
                  <span>Chicago, IL</span>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* SUCCESS CONFIRMATION SCREEN */
        <div className="container success-container" style={{ paddingTop: '140px' }}>
          <div className="success-card">
            <div className="success-icon-badge">
              <Check size={36} color="#059669" strokeWidth={3} />
            </div>

            <h2 className="success-heading">Quote Request Submitted!</h2>
            <p className="success-desc">
              Thank you <strong>{submissionReceipt?.name}</strong>! Your auto insurance quote request has been received. Our top licensed agent will contact you shortly with custom rate options.
            </p>

            <div className="summary-receipt-box">
              <div className="receipt-row">
                <span className="receipt-key">Quote Reference #:</span>
                <span className="receipt-val highlight">{submissionReceipt?.referenceId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Captured Traffic Source:</span>
                <span className="receipt-val highlight" style={{ color: '#2563eb' }}>
                  {submissionReceipt?.trafficSource} ({submissionReceipt?.adPlatform})
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Primary Driver Email:</span>
                <span className="receipt-val">{submissionReceipt?.email}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Phone Number:</span>
                <span className="receipt-val">{submissionReceipt?.phone}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Zip Code & State:</span>
                <span className="receipt-val">
                  {submissionReceipt?.zipCode}, {submissionReceipt?.state}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-key">Submitted Time:</span>
                <span className="receipt-val">{submissionReceipt?.submittedAt}</span>
              </div>
            </div>

            <button onClick={handleResetForm} className="btn-submit" style={{ maxWidth: '300px', margin: '0 auto' }}>
              Request Another Quote
            </button>

            {/* Developer Telemetry Logs Drawer */}
            <div className="developer-drawer-wrapper">
              <button
                type="button"
                className="developer-drawer-toggle"
                onClick={() => setShowDeveloperLogs(!showDeveloperLogs)}
              >
                <Code size={14} />
                <span>{showDeveloperLogs ? 'Hide Background Telemetry Logs' : 'View Background Telemetry Logs (Admin Inspection)'}</span>
                {showDeveloperLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDeveloperLogs && sessionData && (
                <div className="developer-logs-panel">
                  <div>Auto-Captured MongoDB Visitor Document:</div>
                  <div className="panel-grid">
                    <div><span>Session ID:</span> <strong>{sessionData.sessionId}</strong></div>
                    <div><span>IP Address:</span> <strong>{sessionData.ipAddress}</strong></div>
                    <div><span>Device:</span> <strong>{sessionData.device}</strong></div>
                    <div><span>OS:</span> <strong>{sessionData.os}</strong></div>
                    <div><span>Browser:</span> <strong>{sessionData.browser}</strong></div>
                    <div><span>Traffic Source:</span> <strong>{sessionData.trafficSource}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <p>© 2026 DriveCoverageNow. All Rights Reserved. Premium Auto Insurance Comparison.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Disclaimer</a>
            <a href="tel:2165774239" onClick={(e) => handleCallNowClick(e, '(216) 577-4239')}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
