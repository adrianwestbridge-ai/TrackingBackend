// Single source of truth for every live production lead-gen site. Add a new
// site here and it automatically: (1) joins the CORS allow-list in
// server.js, and (2) shows up in the dashboard's website filter and "Manage
// Admins" checkboxes via GET /api/auth/sites - no dashboard code change or
// redeploy needed.
const PRODUCTION_SITES = [
  'https://trackinbound.com',
  'https://drivecoveragenow.com',
  'https://homeinsureusa.com',
  'https://homepolicyassist.com',
  'https://pesthelpcenter.com',
  'https://finalexpquotes.com',
  'https://usacontrolpest.com',
];

module.exports = { PRODUCTION_SITES };
