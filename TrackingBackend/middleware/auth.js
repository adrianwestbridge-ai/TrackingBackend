const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

if (!process.env.JWT_SECRET) {
  console.warn(
    '[Auth] JWT_SECRET is not set - using an insecure default. Set a real ' +
    'JWT_SECRET env var before deploying anywhere real users can reach this.'
  );
}

// Verifies the Bearer token and attaches { id, username, role, allowedOrigins }
// to req.user. This is the only source of truth for who's asking - nothing
// from the request body/query is ever trusted for authorization decisions.
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated - missing token' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authenticated - invalid or expired token' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
  return next();
}

module.exports = { authenticate, requireSuperAdmin, JWT_SECRET };
