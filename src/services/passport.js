const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
const knex = require('../utils/knexfile');
const redis = require('../utils/redisfile');

const accessJwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.MERCHANT_JWT_ACCESS_TOKEN_SECRET
};

const verifyAccessJwt = new JwtStrategy(accessJwtOptions, (payload, done) => {
    console.log("payload:", payload);
    const {exp, merchantId, tokenType} = payload;

    // If token is not an access token, fail
    if (tokenType !== 'access') return done(null, false);

    // Check if token is expired
    const now = Date.now();
    if (exp * 1000 < now) {
        console.log('exp:', exp);
        console.log('now:', now);
        console.log('token expired');
        return done(null, false);
    }

    console.log("merchantId", merchantId);

    knex.select('id', 'email', 'name', 'phone_num')
        .from('merchant')
        .where('id', merchantId)
        .limit(1)
        .then((result) => {
            const merchant = JSON.parse(JSON.stringify(result))[0];
            console.log('merchant matched with token:', merchant);
            return done(null, merchant);
        })
        .catch((err) => {
            return done(err, false);
        });
});

// Ignore expiration so that it can be done manually in the JwtStrategy, and delete Redis key for that token
const refreshJwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.MERCHANT_JWT_REFRESH_TOKEN_SECRET,
    ignoreExpiration: true
};

const verifyRefreshJwt = new JwtStrategy(refreshJwtOptions, (payload, done) => {
    console.log("payload:", payload);
    const {exp, merchantId, tokenType, uuid} = payload;

    // If token is not an refresh token, fail
    if (tokenType !== 'refresh') return done(null, false);

    // If uuid not in Redis store, fail
    // If key doesn't exist, redis.get(uuid) doesn't throw error, but reply is null
    redis.get(uuid, (err, reply) => {
        if (err) return done(err, false);
        // key doesn't exist
        if(reply === null) return done(null, false);
        // Check if token is expired
        const now = Date.now();
        if (exp * 1000 < now) {
            console.log('exp:', exp);
            console.log('now:', now);
            console.log('token expired');
            // If refresh token has expired, delete it from Redis store
            redis.del(uuid);
            return done(null, false);
        }

        console.log("merchantId", merchantId);

        knex.select('id', 'email', 'name', 'phone_num')
            .from('merchant')
            .where('id', merchantId)
            .limit(1)
            .then((result) => {
                const merchant = JSON.parse(JSON.stringify(result))[0];
                console.log('merchant matched with token:', merchant);
                return done(null, {...merchant, uuid});
            })
            .catch((err) => {
                return done(err, false);
            });

    });
});

const localOptions = {
    usernameField: 'email',
    passwordField: 'password'
};

const localSignin = new LocalStrategy(localOptions, (email, password, done) => {
    knex.select()
        .from('merchant')
        .where({email})
        .limit(1)
        .then((result) => {
            if (!result) return done(null, false);
            // console.log('result:', result);
            const merchant = JSON.parse(JSON.stringify(result))[0];
            console.log('merchant:', merchant);
            console.log('merchant id:', merchant.id);
            bcrypt.compare(password, merchant.password, (err, isMatch) => {
                if (err) return done(err);
                if (!isMatch) return done(null, false);
                return done(null, merchant);
            });
        })
        .catch((err) => {
            return done(err);
        });
});

passport.use(localSignin);
passport.use('refresh-jwt', verifyRefreshJwt);
passport.use('access-jwt', verifyAccessJwt);