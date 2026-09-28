const express = require('express');
const router = express.Router();
const {
  saveSession,
  getSessions,
  getSessionById,
  addSessionEvent,
  deleteSession,
} = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');

// POST stays public: it's how visitor-tracking scripts (and the dashboard's
// own call-log edits) send data in. Reading/deleting captured data is
// dashboard-only and scoped to whoever is logged in - see authenticate and
// the isInScope/scopeMongoQuery checks in sessionController.
router.route('/')
  .post(saveSession)
  .get(authenticate, getSessions);

router.route('/:id')
  .get(authenticate, getSessionById)
  .delete(authenticate, deleteSession);

router.route('/:id/events')
  .post(addSessionEvent);

module.exports = router;
