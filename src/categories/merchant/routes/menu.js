const express = require('express');
const passport = require('passport');
const passportService = require('../../../services/passport');

// Endpoint: /api/merchant/menu
const router = express.Router();

// Controller and Passport strategies
const MenuController = require('../../../controllers/merchant/menuController');
const requireAuthAccessToken = passport.authenticate('access-jwt', {session: false});

// Routes
// Create a new menu category for a particular store
router.post('/createMenuCategory', requireAuthAccessToken, MenuController.createMenuCategory);
// Create a new menu item for a particular category
router.post('/createMenuItem', requireAuthAccessToken, MenuController.createMenuItem);
// Get a list of menu categories for a particular store
router.post('/getMenuCategories', requireAuthAccessToken, MenuController.getMenuCategories);
// Get a list of menu items for a particular menu category
router.post('/getMenuItems', requireAuthAccessToken, MenuController.getMenuItems);
// Delete a menu category
router.delete('/deleteMenuCategory', requireAuthAccessToken, MenuController.deleteMenuCategory);
// Delete a menu item
router.delete('/deleteMenuItem', requireAuthAccessToken, MenuController.deleteMenuItem);


// TODO /editMenuCategory
// TODO /editMenuItem
// TODO /editMenuCategoryOrder
// TODO /editMenuItemOrder

module.exports = router;