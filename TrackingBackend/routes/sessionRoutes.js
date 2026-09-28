const express = require('express');
const router = express.Router();
const {
  saveSession,
  getSessions,
  getSessionById,
  addSessionEvent,
  deleteSession,
} = require('../controllers/sessionController');

router.route('/')
  .post(saveSession)
  .get(getSessions);

router.route('/:id')
  .get(getSessionById)
  .delete(deleteSession);

router.route('/:id/events')
  .post(addSessionEvent);

module.exports = router;
