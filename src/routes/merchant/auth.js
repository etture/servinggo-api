const express = require('express');
const passport = require('passport');
const passportService = require('../../services/passport');
const redis = require('../../redisfile');

// Endpoint: /api/merchant/auth
const router = express.Router();

const Authentication = require('../../controllers/authentication');
const requireSignin = passport.authenticate('local', {session: false});
const requireAuthAccessToken = passport.authenticate('access-jwt', {session: false});
const requireAuthRefreshToken = passport.authenticate('refresh-jwt', {session: false});

// Sign-up, Sign-in (returns both access and refresh tokens)
router.post('/signup', Authentication.signup);
router.post('/signin', requireSignin, Authentication.signin);

// Return refreshed access token
router.post('/refresh', requireAuthRefreshToken, Authentication.refreshAccessToken);

// Test Routes
router.post('/token', Authentication.token);
router.post('/testauth', requireAuthAccessToken, Authentication.testAuth);
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