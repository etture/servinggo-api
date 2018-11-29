const express = require('express');
const passport = require('passport');
const passportService = require('../../../services/passport');
const redis = require('../../../utils/redisfile');

// Endpoint: /api/merchant/auth
const router = express.Router();

// Controller and Passport strategies
const AuthController = require('../../../controllers/merchant/authController');
const requireSignin = passport.authenticate('local', {session: false});
const requireAuthAccessToken = passport.authenticate('access-jwt', {session: false});
const requireAuthRefreshToken = passport.authenticate('refresh-jwt', {session: false});

// Routes
// Sign-up, Sign-in (returns both access and refresh tokens)
router.post('/signup', AuthController.signup);
router.post('/signin', requireSignin, AuthController.signin);

// Return refreshed access token
router.post('/refresh', requireAuthRefreshToken, AuthController.refreshAccessToken);



// Test Routes
router.post('/token', AuthController.token);
router.post('/testauth', requireAuthAccessToken, AuthController.testAuth);
router.post('/testheader', (req, res) => {
    console.log('header:', req.headers);
    res.send('header tested');
});
router.post('/testredis', (req, res) => {
    const uuid = req.body.uuid;
    redis.get(uuid, (err, reply) => {
        if(err) {
            console.log('err:', err);
        }else {
            console.log('reply:', reply);
        }
    });
});

module.exports = router;