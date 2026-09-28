const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
const MAX_SIZE = '50mb';

const EXT_BY_MIME = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/wave': '.wav',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
  'audio/webm': '.webm',
};

// @desc    Upload a call recording (raw audio bytes in the request body)
// @route   POST /api/uploads/recording
// @access  Public
router.post('/recording', express.raw({ type: 'audio/*', limit: MAX_SIZE }), (req, res, next) => {
  try {
    const mime = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    const ext = EXT_BY_MIME[mime];

    if (!ext) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported file type. Upload an mp3, wav, ogg, m4a, aac or webm audio file.',
      });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ success: false, message: 'Empty audio file' });
    }

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    // Server-generated name, so nothing from the client ever reaches the file path
    const fileName = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), req.body);

    return res.status(201).json({
      success: true,
      url: `${req.protocol}://${req.get('host')}/uploads/${fileName}`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
