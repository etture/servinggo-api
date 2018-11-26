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
// Menu-related endpoints (create menu category, create menu, etc.)
const menuApi = require('./routes/menu');
// Table-related endpoints (QR generation)
const tableApi = require('./routes/table');

router.use('/auth', authApi);
router.use('/qr', qrApi);
router.use('/store', storeApi);
router.use('/menu', menuApi);
router.use('/table', tableApi);

module.exports = router;