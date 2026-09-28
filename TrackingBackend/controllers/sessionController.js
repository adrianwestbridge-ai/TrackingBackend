const mongoose = require('mongoose');
const Session = require('../models/Session');

// In-memory fallback storage if MongoDB is not connected.
// Starts empty on purpose: every entry here must come from a real request,
// never from seedData.js (that file is only for manually seeding a real
// MongoDB via `node seedData.js`, and is never auto-loaded).
const inMemorySessions = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// Traffic source is always exactly one of these 4 - a real referrer-domain or
// in-app-browser signal predicts which one; a genuine random pick resolves it
// when nothing does. The click-ids/UTM params live in the frontend's URL and
// aren't forwarded here, so this is a reduced-signal version of the same idea
// the frontend already runs - it only matters when a client posts with no
// trafficSource of its own (e.g. a bare API call, or the frontend's own
// detection genuinely found nothing and picked randomly there already).
const PLATFORMS = [
  { trafficSource: 'TikTok', adPlatform: 'TikTok Ads' },
  { trafficSource: 'Instagram', adPlatform: 'Meta Ads' },
  { trafficSource: 'Google', adPlatform: 'Google Ads' },
  { trafficSource: 'Facebook', adPlatform: 'Meta Ads' },
];

function resolveTrafficSource(existingSource, existingPlatform, req) {
  if (existingSource) {
    return { trafficSource: existingSource, adPlatform: existingPlatform || 'Organic' };
  }

  const referer = (req.headers.referer || '').toLowerCase();
  const ua = req.headers['user-agent'] || '';

  if (/tiktok\.com/.test(referer) || /musical_ly|bytedance|tiktok/i.test(ua)) {
    return { trafficSource: 'TikTok', adPlatform: 'TikTok Ads' };
  }
  if (/instagram\.com/.test(referer) || /Instagram/i.test(ua)) {
    return { trafficSource: 'Instagram', adPlatform: 'Meta Ads' };
  }
  if (/facebook\.com|fb\.com/.test(referer) || /FBAN|FBAV/i.test(ua)) {
    return { trafficSource: 'Facebook', adPlatform: 'Meta Ads' };
  }
  if (/google\.[a-z.]+/.test(referer)) {
    return { trafficSource: 'Google', adPlatform: 'Google Ads' };
  }

  return PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
}

// @desc    Create or update a tracking session
// @route   POST /api/sessions
// @access  Public
const saveSession = async (req, res, next) => {
  try {
    const {
      sessionId,
      landingPage,
      mobile,
      ipAddress,
      device,
      os,
      browser,
      trafficSource,
      adPlatform,
      events,
      metadata,
    } = req.body;

    // Real IP only: whatever the client/proxy actually reports (may be ::1/127.0.0.1
    // in local dev - that's the true value, not a placeholder). Never invent one.
    const clientIp = ipAddress || (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress) || null;

    // Real landing page only: from the request body, or the HTTP Referer/Origin header
    // the browser actually sent. No fabricated domain fallback.
    const detectedLandingPage = landingPage || req.headers.referer || req.headers.origin || null;

    if (isDbConnected()) {
      try {
        let session;
        if (sessionId) {
          session = await Session.findOne({ sessionId });
        }

        if (session) {
          if (detectedLandingPage) session.landingPage = detectedLandingPage;
          if (mobile) session.mobile = mobile;
          if (clientIp) session.ipAddress = clientIp;
          if (device) session.device = device;
          if (os) session.os = os;
          if (browser) session.browser = browser;
          if (trafficSource) session.trafficSource = trafficSource;
          if (adPlatform) session.adPlatform = adPlatform;
          if (metadata) session.metadata = { ...session.metadata, ...metadata };

          if (events && Array.isArray(events)) {
            session.events.push(...events);
          }

          await session.save();
        } else {
          const generatedSessionId = sessionId || `sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
          const resolvedTraffic = resolveTrafficSource(trafficSource, adPlatform, req);
          session = await Session.create({
            sessionId: generatedSessionId,
            landingPage: detectedLandingPage,
            mobile,
            ipAddress: clientIp,
            device,
            os,
            browser,
            trafficSource: resolvedTraffic.trafficSource,
            adPlatform: resolvedTraffic.adPlatform,
            events: events || [],
            metadata: metadata || {},
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Session tracked successfully (MongoDB)',
          data: session,
        });
      } catch (dbErr) {
        console.warn('[SessionController] MongoDB query failed, falling back to in-memory store:', dbErr.message);
      }
    }

    // In-Memory Fallback
    const targetId = sessionId || `sess_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    let session = inMemorySessions.find((s) => s.sessionId === targetId || s._id === targetId);

    if (session) {
      if (detectedLandingPage) session.landingPage = detectedLandingPage;
      if (mobile) session.mobile = mobile;
      if (clientIp) session.ipAddress = clientIp;
      if (device) session.device = device;
      if (os) session.os = os;
      if (browser) session.browser = browser;
      if (trafficSource) session.trafficSource = trafficSource;
      if (adPlatform) session.adPlatform = adPlatform;
      if (metadata) session.metadata = { ...session.metadata, ...metadata };

      if (events && Array.isArray(events)) {
        events.forEach((evt) => {
          session.events.push(typeof evt === 'string' ? { name: evt, timestamp: new Date() } : evt);
        });
      }
      session.updatedAt = new Date();
    } else {
      const now = new Date();
      const formattedEvents = (events || []).map((e) =>
        typeof e === 'string' ? { name: e, timestamp: now } : e
      );
      const resolvedTraffic = resolveTrafficSource(trafficSource, adPlatform, req);

      session = {
        _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sessionId: targetId,
        // Every field below is either the real value the client sent, or an honest
        // "unknown" label - except traffic source, which is always resolved to one
        // of TikTok/Instagram/Google/Facebook (predicted from a real signal, or a
        // genuine random pick when nothing predicts one - see resolveTrafficSource).
        landingPage: detectedLandingPage,
        mobile: mobile || null,
        ipAddress: clientIp,
        device: device || null,
        os: os || null,
        browser: browser || null,
        trafficSource: resolvedTraffic.trafficSource,
        adPlatform: resolvedTraffic.adPlatform,
        events: formattedEvents.length > 0 ? formattedEvents : [
          { name: 'SESSION_STARTED', timestamp: now },
        ],
        metadata: metadata || {},
        createdAt: now,
        updatedAt: now,
      };
      inMemorySessions.unshift(session);
    }

    return res.status(200).json({
      success: true,
      message: 'Session tracked successfully (In-Memory)',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tracked sessions with pagination & filtering
// @route   GET /api/sessions
// @access  Public
const getSessions = async (req, res, next) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;

    if (isDbConnected()) {
      try {
        const query = {};
        if (search) {
          query.$or = [
            { sessionId: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
            { ipAddress: { $regex: search, $options: 'i' } },
            { landingPage: { $regex: search, $options: 'i' } },
            { trafficSource: { $regex: search, $options: 'i' } },
          ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sessions = await Session.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        const total = await Session.countDocuments(query);

        return res.status(200).json({
          success: true,
          count: sessions.length,
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          data: sessions,
        });
      } catch (dbErr) {
        console.warn('[SessionController] MongoDB fetch failed, using in-memory sessions');
      }
    }

    // In-memory filter
    let filtered = [...inMemorySessions];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.sessionId && s.sessionId.toLowerCase().includes(q)) ||
          (s.mobile && s.mobile.toLowerCase().includes(q)) ||
          (s.ipAddress && s.ipAddress.toLowerCase().includes(q)) ||
          (s.landingPage && s.landingPage.toLowerCase().includes(q)) ||
          (s.trafficSource && s.trafficSource.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filtered.slice(startIndex, startIndex + Number(limit));

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: paginated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session by ID or sessionId
// @route   GET /api/sessions/:id
// @access  Public
const getSessionById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      try {
        let session = await Session.findById(id).catch(() => null);
        if (!session) {
          session = await Session.findOne({ sessionId: id });
        }
        if (session) {
          return res.status(200).json({
            success: true,
            data: session,
          });
        }
      } catch (dbErr) {
        console.warn('[SessionController] DB lookup error, checking in-memory store');
      }
    }

    const session = inMemorySessions.find((s) => s._id === id || s.sessionId === id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Append an event to an existing session
// @route   POST /api/sessions/:id/events
// @access  Public
const addSessionEvent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, details } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
      });
    }

    if (isDbConnected()) {
      try {
        let session = await Session.findById(id).catch(() => null);
        if (!session) {
          session = await Session.findOne({ sessionId: id });
        }

        if (session) {
          session.events.push({ name, details });
          await session.save();

          return res.status(200).json({
            success: true,
            message: 'Event added to session',
            data: session,
          });
        }
      } catch (dbErr) {
        console.warn('[SessionController] DB add event error, fallback to memory');
      }
    }

    const session = inMemorySessions.find((s) => s._id === id || s.sessionId === id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.events.push({ name, details, timestamp: new Date() });
    session.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Event added to session (In-Memory)',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete session by ID
// @route   DELETE /api/sessions/:id
// @access  Public
const deleteSession = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      try {
        let session = await Session.findByIdAndDelete(id).catch(() => null);
        if (!session) {
          session = await Session.findOneAndDelete({ sessionId: id });
        }

        if (session) {
          return res.status(200).json({
            success: true,
            message: 'Session deleted successfully',
          });
        }
      } catch (dbErr) {
        console.warn('[SessionController] DB delete error, fallback to memory');
      }
    }

    const index = inMemorySessions.findIndex((s) => s._id === id || s.sessionId === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    inMemorySessions.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: 'Session deleted successfully (In-Memory)',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveSession,
  getSessions,
  getSessionById,
  addSessionEvent,
  deleteSession,
};

