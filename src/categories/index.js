const express = require('express');

// Endpoint: /api
const router = express.Router();

// Routes
const customerRoute = require('./customer/index');
const merchantRoute = require('./merchant/index');

router.use('/customer', customerRoute);
router.use('/merchant', merchantRoute);

module.exports = router;