const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // 'superadmin' sees every website's data and can create scoped admins.
    // 'admin' only ever sees data for the origins listed in allowedOrigins -
    // this is enforced server-side in sessionController, never trust a
    // client-supplied value for this.
    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      default: 'admin',
    },
    // Website origins (e.g. "https://drivecoveragenow.com") this admin may
    // see. Ignored for role 'superadmin'.
    allowedOrigins: {
      type: [String],
      default: [],
    },
    // Optional white-label name shown in place of "Track Inbound" in this
    // admin's own sidebar/login (e.g. "Zing Leads"). Falls back to the
    // default brand when not set.
    brandName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admin', adminSchema);
