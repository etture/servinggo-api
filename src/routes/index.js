const express = require('express');

// Endpoint: /api
const router = express.Router();

// Routes
const customer_route = require('./customer/index');
const merchant_route = require('./merchant/index');

router.use('/customer', customer_route);
router.use('/merchant', merchant_route);

module.exports = router;