const express = require('express');

// Endpoint: /api
const router = express.Router();

// Routes
const qr_api = require('./routes/merchant/qr_api');
const store_api = require('./routes/customer/store_api');

router.use('/qr', qr_api);
router.use('/store', store_api);

module.exports = router;