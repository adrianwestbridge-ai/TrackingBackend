const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    token: {
      type: String,
    },
    siteUrl: {
      type: String,
      trim: true,
    },
    clientIp: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Credential', credentialSchema);
