const passport = require('passport');
const config = require('./config_merchant');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
const knex = require('../knexfile');

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.jwt_access_token_secret
};

const jwtVerify = new JwtStrategy(jwtOptions, (payload, done) => {
    console.log("payload:", payload);
    const {exp, merchant_id} = payload;
    const now = Date.now();
    if (exp * 1000 < now) {
        console.log('exp:', exp);
        console.log('now:', now);
        console.log('token expired');
        return done(null, false);
    }

    console.log("merchant_id", merchant_id);

    knex.select()
        .from('merchant')
        .where('id', merchant_id)
        .limit(1)
        .then((result) => {
            const merchant = JSON.parse(JSON.stringify(result))[0];
            console.log('merchant matched with token:', merchant);
            done(null, merchant);
        })
        .catch((err) => {
            return done(err, false);
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
            console.log('result:', result);
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
passport.use(jwtVerify);