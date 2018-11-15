const express = require('express');

// Endpoint: /api/merchant
const router = express.Router();

// Routes
const authApi = require('./auth');
const qrApi = require('./qr');

router.use('/auth', authApi);
router.use('/qr', qrApi);

module.exports = router;