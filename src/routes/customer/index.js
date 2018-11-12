const express = require('express');

// Endpoint: /api/customer
const router = express.Router();

// Routes
const store_api = require('./store');

router.use('/store', store_api);

module.exports = router;