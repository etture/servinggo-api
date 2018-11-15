const express = require('express');

// Endpoint: /api/customer
const router = express.Router();

// Routes
const storeApi = require('./store');

router.use('/store', storeApi);

module.exports = router;