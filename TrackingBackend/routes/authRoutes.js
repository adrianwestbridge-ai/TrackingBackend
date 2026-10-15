const express = require('express');
const router = express.Router();
const { login, createAdmin, listAdmins, updateAdmin, deleteAdmin, getKnownSites } = require('../controllers/authController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

router.post('/login', login);

// Every known production site origin - any logged-in admin (not just super
// admin) can read this; it's just a list of domain names, not sensitive.
router.get('/sites', authenticate, getKnownSites);

// Admin management - super admin only.
router.route('/admins')
  .get(authenticate, requireSuperAdmin, listAdmins)
  .post(authenticate, requireSuperAdmin, createAdmin);

router.route('/admins/:id')
  .patch(authenticate, requireSuperAdmin, updateAdmin)
  .delete(authenticate, requireSuperAdmin, deleteAdmin);

module.exports = router;
