const express = require('express');
const passport = require('passport');
const passportService = require('../../../services/passport');

// Endpoint: /api/merchant/table
const router = express.Router();

// Controller and Passport strategies
const TableController = require('../../../controllers/merchant/tableController');
const requireAuthAccessToken = passport.authenticate('access-jwt', {session: false});

//Routes
// Add a table to a particular store (require storeId, tableNum)
router.post('/addTable', requireAuthAccessToken, TableController.addTable);
// Remove a table from a particular store (require storeId, tableNum)
router.delete('/removeTable', requireAuthAccessToken, TableController.removeTable);
// Get a list of all tables registered at a store (require storeId)
router.post('/getTables', requireAuthAccessToken, TableController.getTables);
// Download QR file
router.post('/downloadQR', requireAuthAccessToken, TableController.downloadQR);

module.exports = router;