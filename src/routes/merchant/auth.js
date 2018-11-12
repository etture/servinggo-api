const express = require('express');
const passport = require('passport');
const passportService = require('../../services/passport');

// Endpoint: /api/merchant/auth
const router = express.Router();

const Authentication = require('../../controllers/authentication');
const requireSignin = passport.authenticate('local', {session: false});
const requireAuth = passport.authenticate('jwt', {session: false});

router.post('/token', Authentication.token);
router.post('/refresh', Authentication.refreshAccessToken);
router.post('/signup', Authentication.signup);
router.post('/signin', requireSignin, Authentication.signin);
router.post('/jwt_test', requireAuth, Authentication.test);

module.exports = router;