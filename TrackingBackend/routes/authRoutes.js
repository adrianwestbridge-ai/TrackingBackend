const express = require('express');
const router = express.Router();
const { login, createAdmin, listAdmins, deleteAdmin } = require('../controllers/authController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

router.post('/login', login);

// Admin management - super admin only.
router.route('/admins')
  .get(authenticate, requireSuperAdmin, listAdmins)
  .post(authenticate, requireSuperAdmin, createAdmin);

router.delete('/admins/:id', authenticate, requireSuperAdmin, deleteAdmin);

module.exports = router;
