const jwt = require('jsonwebtoken');
const config = require('../services/config_merchant');
const bcrypt = require('bcrypt-nodejs');
const knex = require('../knexfile');
const redis = require('../redisfile');
const uuidv1 = require('uuid/v1');

// Function to sign JWT
const signToken = (tokenType, merchantId) => {
    // uuid as key in Redis store
    const uuid = uuidv1();
    if (tokenType === "access") {
        const token = jwt.sign({tokenType, merchantId, uuid}, process.env.MERCHANT_JWT_ACCESS_TOKEN_SECRET, {expiresIn: process.env.MERCHANT_JWT_ACCESS_TOKEN_LIFE});
        console.log(`token secret: ${process.env.MERCHANT_JWT_ACCESS_TOKEN_SECRET}, expiresIn: ${process.env.MERCHANT_JWT_ACCESS_TOKEN_LIFE}`);
        return {token, uuid};
    } else if (tokenType === "refresh") {
        const token = jwt.sign({tokenType, merchantId, uuid}, process.env.MERCHANT_JWT_REFRESH_TOKEN_SECRET, {expiresIn: process.env.MERCHANT_JWT_REFRESH_TOKEN_LIFE});
        return {token, uuid};
    } else {
        return false;
    }
};

// 일단 사장님 쪽 부터
const getTokenAtSignIn = (merchantId) => {
    console.log('merchantId:', merchantId);
    const accessTokenUuid = signToken('access', merchantId);
    const refreshTokenUuid = signToken('refresh', merchantId);

    // Redis in-memory store
    redis.set(refreshTokenUuid.uuid, accessTokenUuid.token);
    console.log("accessToken:", accessTokenUuid.token);

    return {
        accessToken: accessTokenUuid.token,
        refreshToken: refreshTokenUuid.token
    };
};

exports.refreshAccessToken = (req, res, next) => {
    // Get merchant_id, refresh token uuid
    const {id: merchantId, uuid} = req.user;
    console.log('refresh token uuid:', uuid);
    const accessTokenUuid = signToken('access', merchantId);

    // Redis in-memory store
    redis.set(uuid, accessTokenUuid.token);

    res.status(200).json({accessToken: accessTokenUuid.token});
};

const hashPassword = (plainPassword, next) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        // Hash password
        bcrypt.hash(plainPassword, salt, null, (err, hashedPassword) => {
            if (err) return next(err);
            next(null, hashedPassword);
        });
    });
};

exports.signup = (req, res, next) => {
    const email = req.body.email;
    let password = req.body.password;
    const name = req.body.name;
    const phoneNum = req.body.phone_num;

    if (!email || !password) {
        return res.status(422).send({errorMessage: 'Must provide both email and password'});
    }

    knex.select()
        .from('merchant')
        .where({email})
        .limit(1)
        .then((result) => {
            if (result.length > 0) {
                return res.status(422).send({errorMessage: 'Email is in use'});
            }

            hashPassword(password, (err, hash) => {
                if (err) return next(err);
                password = hash;

                knex.insert({email, password, name, phone_num: phoneNum})
                    .into('merchant')
                    .returning('id')
                    .then((id) => {
                        console.log('hashed pw:', password);
                        //Create and send JWT using the user_id
                        res.json({
                            isSuccess: true,
                            user: {
                                merchantId: id[0],
                                email, name, phoneNum
                            },
                            token: getTokenAtSignIn(id[0])
                        });
                    })
                    .catch((err) => {
                        res.status(400).json(err);
                    });
            });
        })
        .catch((err) => {
            next(err);
        });
};

exports.signin = (req, res, next) => {
    // console.log('req', req);
    res.status(200).json({
        isSuccess: true,
        token: getTokenAtSignIn(req.user.id)
    })
};

exports.token = (req, res, next) => {
    const merchantId = req.body.merchant_id;
    const tokens = getTokenAtSignIn(merchantId);
    res.json(tokens);
};

exports.testAuth = (req, res, next) => {
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    res.send('cool');
};

exports.checkRefreshTokenInMemory = (req, res, next) => {
    const refreshToken = req.get('authorization');
    redis.get(refreshToken, (err, reply) => {
        if (err) return next(err);
        next(req, res);
    });
};