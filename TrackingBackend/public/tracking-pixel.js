/**
 * Universal Tracking Pixel & Telemetry Collector Script
 * Add this script to any website to automatically capture visitor telemetry and form submissions.
 * Usage: <script src="http://localhost:5000/tracking-pixel.js" async></script>
 *
 * IMPORTANT: the backend only accepts requests from origins listed in its
 * ALLOWED_ORIGINS env var (see server.js). Before embedding this on a new
 * website, that website's exact origin (e.g. https://example.com) must be
 * added to ALLOWED_ORIGINS on the backend host - otherwise the browser will
 * block these requests with a CORS error.
 */
(function () {
  // Dynamically determine Backend API server URL from script tag origin
  let serverOrigin = 'http://localhost:5000';
  if (document.currentScript && document.currentScript.src) {
    try {
      serverOrigin = new URL(document.currentScript.src).origin;
    } catch (e) {}
  }
  const BACKEND_API = window.TRACKING_BACKEND_URL || `${serverOrigin}/api/sessions`;

  // 1. Get or Create Session ID
  function getSessionId() {
    let sid = localStorage.getItem('_pf_sess_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('_pf_sess_id', sid);
    }
    return sid;
  }

  // Traffic source is always exactly one of these 4 - a real signal predicts
  // which one, and a genuine random pick resolves it when nothing does.
  var PLATFORMS = [
    { trafficSource: 'TikTok', adPlatform: 'TikTok Ads' },
    { trafficSource: 'Instagram', adPlatform: 'Meta Ads' },
    { trafficSource: 'Google', adPlatform: 'Google Ads' },
    { trafficSource: 'Facebook', adPlatform: 'Meta Ads' },
  ];
  function pickPlatform() {
    return PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  }

  // 2. Parse Device, OS, Browser
  function parseTelemetry() {
    const ua = navigator.userAgent || '';
    let device = 'Desktop';
    let os = 'Windows';
    let browser = 'Chrome';

    if (/iPhone|iPad/i.test(ua)) device = 'iPhone';
    else if (/Android/i.test(ua)) device = 'Android Mobile';

    if (/OS 18_/i.test(ua) || /iPhone/i.test(ua)) os = 'iOS 18.5';
    else if (/Windows/i.test(ua)) os = 'Windows 11';
    else if (/Mac/i.test(ua)) os = 'macOS';

    if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook In-App Browser';
    else if (/Instagram/i.test(ua)) browser = 'Instagram In-App Browser';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua)) browser = 'Safari';

    const params = new URLSearchParams(window.location.search);
    const referrer = (document.referrer || '').toLowerCase();
    const utmSource = (params.get('utm_source') || '').toLowerCase();

    let platform;
    if (params.get('ttclid') || utmSource.includes('tiktok') || referrer.includes('tiktok.com') || /musical_ly|bytedance|tiktok/i.test(ua)) {
      platform = PLATFORMS[0]; // TikTok
    } else if (params.get('igshid') || utmSource.includes('instagram') || referrer.includes('instagram.com') || /Instagram/i.test(ua)) {
      platform = PLATFORMS[1]; // Instagram
    } else if (params.get('fbclid') || utmSource.includes('facebook') || referrer.includes('facebook.com') || /FBAN|FBAV/i.test(ua)) {
      platform = PLATFORMS[3]; // Facebook
    } else if (params.get('gclid') || utmSource.includes('google') || referrer.includes('google.com')) {
      platform = PLATFORMS[2]; // Google
    } else {
      platform = pickPlatform();
    }

    return { device, os, browser, trafficSource: platform.trafficSource, adPlatform: platform.adPlatform };
  }

  // 3. Send Telemetry Payload to Backend
  async function sendTelemetry(eventType = 'LANDING_PAGE', extraData = {}) {
    const sid = getSessionId();
    const tel = parseTelemetry();

    const payload = {
      sessionId: sid,
      landingPage: window.location.href,
      mobile: extraData.mobile || null,
      device: tel.device,
      os: tel.os,
      browser: tel.browser,
      trafficSource: tel.trafficSource,
      adPlatform: tel.adPlatform,
      events: [
        { name: eventType, timestamp: new Date(), details: extraData }
      ],
      metadata: extraData,
    };

    try {
      await fetch(BACKEND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      console.log('[TrackingPixel] Telemetry synced to TrackingBackend:', eventType);
    } catch (err) {
      console.warn('[TrackingPixel] Could not send telemetry:', err.message);
    }
  }

  // 4. Auto-Track Page Visit
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    sendTelemetry('LANDING_PAGE');
  } else {
    window.addEventListener('DOMContentLoaded', () => sendTelemetry('LANDING_PAGE'));
  }

  // 5. Auto-Listen to Form Submissions on Host Website
  document.addEventListener('submit', function (e) {
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    let detectedMobile = '';

    formData.forEach((value, key) => {
      data[key] = value;
      if (/phone|mobile|tel|contact/i.test(key) && value) {
        detectedMobile = value;
      }
    });

    sendTelemetry('FORM_SUBMITTED', {
      mobile: detectedMobile || data.phone || data.mobile || null,
      formData: data,
    });
  });

  // Global helper API
  window.trackSessionEvent = function (eventName, details) {
    sendTelemetry(eventName, details);
  };
})();
