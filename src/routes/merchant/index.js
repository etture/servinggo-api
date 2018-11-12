const express = require('express');

// Endpoint: /api/merchant
const router = express.Router();

// Routes
const auth_api = require('./auth');
const qr_api = require('./qr');

router.use('/auth', auth_api);
router.use('/qr', qr_api);

module.exports = router;