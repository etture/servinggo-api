const express = require('express');

// Endpoint: /api/merchant
const router = express.Router();

// Routes
// Authentication (signin, signup)
const authApi = require('./routes/auth');
// QR code generation
const qrApi = require('./routes/qr');
// Store-related endpoints (create store, configure settings, etc.)
const storeApi = require('./routes/store');

router.use('/auth', authApi);
router.use('/qr', qrApi);
router.use('/store', storeApi);

module.exports = router;