const express = require('express');
const router = express.Router();
const {
  saveCredentials,
  getCredentials,
  getCredentialById,
  deleteCredential,
} = require('../controllers/credentialController');

router.route('/')
  .post(saveCredentials)
  .get(getCredentials);

router.route('/:id')
  .get(getCredentialById)
  .delete(deleteCredential);

module.exports = router;
