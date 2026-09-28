const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { ensureSuperAdmin } = require('./controllers/authController');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Make sure there's always a super admin to log in with. See
// controllers/authController.js for the default username/password
// (SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD env vars).
ensureSuperAdmin().catch((err) => console.error('[Auth] Failed to seed super admin:', err.message));

const app = express();

const path = require('path');

// Which websites may call this API. Any localhost/127.0.0.1 dev server, on any
// port, is always allowed - that's a developer's own machine, so a new local
// test site never needs a backend code change to work with `npm run dev`.
// A real production domain (this site or a future one) is added via the
// ALLOWED_ORIGINS env var - a comma-separated list - so onboarding a new
// production website never needs a code change or redeploy either, just
// updating that one env var on the host.
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
const EXTRA_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // No Origin header (server-to-server calls, curl, Postman) is always allowed.
    if (!origin || LOCAL_ORIGIN_PATTERN.test(origin) || EXTRA_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/credentials', require('./routes/credentialRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// 404 & Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/health`);
  console.log(`Credentials API: http://localhost:${PORT}/api/credentials`);
  console.log(`Sessions API: http://localhost:${PORT}/api/sessions`);
  console.log(`=================================`);
});
