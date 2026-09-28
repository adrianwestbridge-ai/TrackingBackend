const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { JWT_SECRET } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback store, mirroring the pattern used for sessions elsewhere
// in this backend. Lost on restart when there's no real MongoDB connected -
// the default super admin is always re-seeded on startup regardless.
const inMemoryAdmins = [];

const TOKEN_EXPIRY = '12h';

function signToken(admin) {
  return jwt.sign(
    {
      id: admin._id ? admin._id.toString() : admin.id,
      username: admin.username,
      role: admin.role,
      allowedOrigins: admin.allowedOrigins || [],
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function publicAdmin(admin) {
  return {
    id: admin._id ? admin._id.toString() : admin.id,
    username: admin.username,
    role: admin.role,
    allowedOrigins: admin.allowedOrigins || [],
    createdAt: admin.createdAt,
  };
}

// Seed a default super admin so there's always a way to log in. Called once
// at server startup - see server.js.
async function ensureSuperAdmin() {
  const username = (process.env.SUPERADMIN_USERNAME || 'superadmin').toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD || 'ChangeMe123!';

  if (isDbConnected()) {
    try {
      const existing = await Admin.findOne({ role: 'superadmin' });
      if (!existing) {
        const passwordHash = await bcrypt.hash(password, 10);
        await Admin.create({ username, passwordHash, role: 'superadmin', allowedOrigins: [] });
        console.log(`[Auth] Seeded default super admin "${username}" in MongoDB.`);
      }
      return;
    } catch (err) {
      console.warn('[Auth] Could not seed super admin in MongoDB, falling back to in-memory:', err.message);
    }
  }

  if (!inMemoryAdmins.some((a) => a.role === 'superadmin')) {
    const passwordHash = await bcrypt.hash(password, 10);
    inMemoryAdmins.push({
      id: `admin_${Date.now()}`,
      username,
      passwordHash,
      role: 'superadmin',
      allowedOrigins: [],
      createdAt: new Date(),
    });
    console.log(`[Auth] Seeded default super admin "${username}" (in-memory - lost on restart).`);
  }
}

// @desc    Log in and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const uname = username.toLowerCase().trim();

    let admin = null;
    if (isDbConnected()) {
      try {
        admin = await Admin.findOne({ username: uname });
      } catch (err) {
        console.warn('[Auth] MongoDB lookup failed, checking in-memory:', err.message);
      }
    }
    if (!admin) {
      admin = inMemoryAdmins.find((a) => a.username === uname) || null;
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const matches = await bcrypt.compare(password, admin.passwordHash);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = signToken(admin);
    return res.status(200).json({ success: true, token, user: publicAdmin(admin) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scoped admin
// @route   POST /api/auth/admins
// @access  Super admin only
const createAdmin = async (req, res, next) => {
  try {
    const { username, password, allowedOrigins } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one website this admin may access' });
    }
    const uname = username.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    if (isDbConnected()) {
      try {
        const exists = await Admin.findOne({ username: uname });
        if (exists) {
          return res.status(409).json({ success: false, message: 'That username is already taken' });
        }
        const created = await Admin.create({ username: uname, passwordHash, role: 'admin', allowedOrigins });
        return res.status(201).json({ success: true, data: publicAdmin(created) });
      } catch (err) {
        console.warn('[Auth] MongoDB create failed, falling back to in-memory:', err.message);
      }
    }

    if (inMemoryAdmins.some((a) => a.username === uname)) {
      return res.status(409).json({ success: false, message: 'That username is already taken' });
    }
    const created = {
      id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: uname,
      passwordHash,
      role: 'admin',
      allowedOrigins,
      createdAt: new Date(),
    };
    inMemoryAdmins.push(created);
    return res.status(201).json({ success: true, data: publicAdmin(created) });
  } catch (error) {
    next(error);
  }
};

// @desc    List all admins (so the Create Admin screen can show who exists)
// @route   GET /api/auth/admins
// @access  Super admin only
const listAdmins = async (req, res, next) => {
  try {
    let admins = inMemoryAdmins;
    if (isDbConnected()) {
      try {
        admins = await Admin.find({});
      } catch (err) {
        console.warn('[Auth] MongoDB list failed, using in-memory:', err.message);
      }
    }
    return res.status(200).json({ success: true, data: admins.map(publicAdmin) });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a scoped admin (never a super admin)
// @route   DELETE /api/auth/admins/:id
// @access  Super admin only
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const target = await Admin.findById(id);
        if (target) {
          if (target.role === 'superadmin') {
            return res.status(400).json({ success: false, message: 'Cannot delete a super admin' });
          }
          await Admin.findByIdAndDelete(id);
          return res.status(200).json({ success: true, message: 'Admin deleted' });
        }
      } catch (err) {
        console.warn('[Auth] MongoDB delete failed, checking in-memory:', err.message);
      }
    }

    const idx = inMemoryAdmins.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    if (inMemoryAdmins[idx].role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot delete a super admin' });
    }
    inMemoryAdmins.splice(idx, 1);
    return res.status(200).json({ success: true, message: 'Admin deleted (in-memory)' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ensureSuperAdmin,
  login,
  createAdmin,
  listAdmins,
  deleteAdmin,
};
