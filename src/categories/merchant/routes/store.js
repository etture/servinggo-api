const express = require('express');
const passport = require('passport');
const passportService = require('../../../services/passport');

// Endpoint: /api/merchant/store
const router = express.Router();

// Controller and Passport strategies
const StoreController = require('../../../controllers/merchant/storeController');
const requireAuthAccessToken = passport.authenticate('access-jwt', {session: false});

// Routes
// Create new store by merchant
router.post('/createNewStore', requireAuthAccessToken, StoreController.createNewStore);
// Get the list of all stores owned by the merchant
router.get('/getStores', requireAuthAccessToken, StoreController.getStores);
// Edit store description
router.put('/editStoreDesc', requireAuthAccessToken, StoreController.editStoreDesc);

module.exports = router;