const express = require('express');
const passport = require('passport');
const passportService = require('../../../services/passport');

// Endpoint: /api/merchant/menu
const router = express.Router();

// Controller and Passport strategies
const MenuController = require('../../../controllers/merchant/menuController');
const requireAuthAccessToken = passport.authenticate('access-jwt', {session: false});

// Routes
// Create a new menu cateogory for a particular store
router.post('/createMenuCategory', requireAuthAccessToken, MenuController.createMenuCategory);

module.exports = router;