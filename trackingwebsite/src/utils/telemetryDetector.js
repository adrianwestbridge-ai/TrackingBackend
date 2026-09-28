/**
 * Automatic Browser & Visitor Telemetry Detection Utility
 * Automatically collects client IP, Device, OS, Browser, Traffic Source, Ad Platform, and Session ID.
 *
 * Device/OS/browser/IP are read from something real (the user agent, a real IP
 * lookup) or an honest "unknown" label. Traffic source is always exactly one of
 * TikTok/Instagram/Google/Facebook: a real click-id, UTM tag, referrer domain,
 * or in-app-browser fingerprint predicts which one; if none of those match,
 * one of the four is picked at random. This runs fresh on every call, so the
 * same visitor's landing/submit/call-click events can legitimately land on
 * different platforms if nothing strongly predicts one.
 */

const PLATFORMS = [
  { trafficSource: 'TikTok', adPlatform: 'TikTok Ads' },
  { trafficSource: 'Instagram', adPlatform: 'Meta Ads' },
  { trafficSource: 'Google', adPlatform: 'Google Ads' },
  { trafficSource: 'Facebook', adPlatform: 'Meta Ads' },
];

function pickRandomPlatform() {
  return PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
}

// Generate a fresh new Session ID for each submission
export function createNewSessionId() {
  const newId = `sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
  localStorage.setItem('track_session_id', newId);
  return newId;
}

// Get or retrieve Session ID
export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('track_session_id');
  if (!sessionId) {
    sessionId = createNewSessionId();
  }
  return sessionId;
}

// Auto-detect User Agent parameters (Browser, OS, Device)
export function parseUserAgent() {
  const ua = navigator.userAgent || '';

  let device = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  // Device detection
  if (/iPhone/i.test(ua)) {
    device = 'iPhone';
  } else if (/iPad/i.test(ua)) {
    device = 'iPad';
  } else if (/Android/i.test(ua)) {
    device = /Mobile/i.test(ua) ? 'Android Mobile' : 'Android Tablet';
  } else if (/Macintosh/i.test(ua)) {
    device = 'Mac Desktop';
  }

  // OS detection
  if (/CPU iPhone OS/i.test(ua) || /iPhone/i.test(ua)) {
    const match = ua.match(/CPU iPhone OS ([\d_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/Android ([\d.]+)/i.test(ua)) {
    const match = ua.match(/Android ([\d.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/Windows NT 10/i.test(ua)) {
    os = 'Windows 11';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
  } else if (/Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // Browser detection
  if (/FBAN|FBAV/i.test(ua)) {
    browser = 'Facebook In-App Browser';
  } else if (/Instagram/i.test(ua)) {
    browser = 'Instagram In-App Browser';
  } else if (/Edg/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
  }

  return { device, os, browser };
}

// Detect Traffic Source and Ad Platform. Strong signals (click ids, UTM tags,
// referrer domain, in-app-browser fingerprint) predict one of the 4 platforms;
// anything else - including a real referrer from some other site entirely, or
// no referrer at all - is resolved with a genuine random pick among the 4.
export function detectAttribution() {
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = (document.referrer || '').toLowerCase();
  const ua = navigator.userAgent || '';

  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const fbclid = urlParams.get('fbclid');
  const gclid = urlParams.get('gclid');
  const ttclid = urlParams.get('ttclid');
  const igshid = urlParams.get('igshid');

  const src = (utmSource || '').toLowerCase();

  if (ttclid || src.includes('tiktok') || referrer.includes('tiktok.com') || /musical_ly|bytedance|tiktok/i.test(ua)) {
    return { trafficSource: 'TikTok', adPlatform: 'TikTok Ads', utmSource, utmMedium };
  } else if (igshid || src.includes('instagram') || referrer.includes('instagram.com') || /Instagram/i.test(ua)) {
    return { trafficSource: 'Instagram', adPlatform: 'Meta Ads', utmSource, utmMedium };
  } else if (fbclid || src.includes('facebook') || referrer.includes('facebook.com') || /FBAN|FBAV/i.test(ua)) {
    return { trafficSource: 'Facebook', adPlatform: 'Meta Ads', utmSource, utmMedium };
  } else if (gclid || src.includes('google') || referrer.includes('google.com')) {
    return { trafficSource: 'Google', adPlatform: 'Google Ads', utmSource, utmMedium };
  }

  // No strong signal for any of the 4 - including a real referrer from some
  // other site, or none at all - so it's resolved with a genuine random pick.
  return { ...pickRandomPlatform(), utmSource, utmMedium };
}

// Auto-fetch the visitor's real public IP. Returns null (never a fake IP) if the lookup fails.
export async function autoFetchClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    if (data && data.ip) return data.ip;
  } catch (e) {
    // Lookup service unreachable/timed out - report unknown rather than guessing.
  }
  return null;
}

// Master Function: Gather complete visitor telemetry automatically
export async function gatherAutoTelemetry(freshSession = false) {
  const sessionId = freshSession ? createNewSessionId() : getOrCreateSessionId();
  const { device, os, browser } = parseUserAgent();
  const { trafficSource, adPlatform } = detectAttribution();
  const ipAddress = await autoFetchClientIp();
  const rawUrl = window.location.href || '';
  const landingPage = rawUrl && !rawUrl.includes('about:blank') ? rawUrl : null;

  return {
    sessionId,
    landingPage,
    // No phone number is known yet at this point - filled in for real once the visitor submits the form.
    mobile: null,
    ipAddress,
    device,
    os,
    browser,
    trafficSource,
    adPlatform,
    events: [
      { name: 'LANDING_PAGE', timestamp: new Date() },
    ],
  };
}
