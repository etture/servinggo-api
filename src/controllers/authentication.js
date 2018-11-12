const jwt = require('jsonwebtoken');
const config = require('../services/config_merchant');
const bcrypt = require('bcrypt-nodejs');
const knex = require('../knexfile');

const tokenList = {};

// 일단 사장님 쪽 부터
const getTokenAtSignIn = (merchant_id) => {
    console.log('merchant_id:', merchant_id);
    const access_token = jwt.sign({merchant_id}, config.jwt_access_token_secret, {expiresIn: config.jwt_access_token_life});
    const refresh_token = jwt.sign({merchant_id}, config.jwt_refresh_token_secret, {expiresIn: config.jwt_refresh_token_life});

    tokenList[refresh_token] = {access_token, refresh_token};
    console.log("access_token:", access_token);

    return tokenList[refresh_token];
};

exports.refreshAccessToken = (req, res, next) => {
    if((req.body.refresh_token) && (req.body.refresh_token in tokenList)){
        const access_token = jwt.sign({merchant_id: req.body.merchant_id}, config.jwt_access_token_secret, {expiresIn: config.jwt_access_token_life});

        tokenList[req.body.refresh_token].access_token = access_token;
        res.status(200).json({access_token});
    }else{
        res.status(404).send('Invalid request');
    }
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
    const phone_num = req.body.phone_num;

    if (!email || !password) {
        return res.status(422).send({errorMessage: 'Must provide both email and password'});
    }

    knex.select()
        .from('merchant')
        .where({email})
        .limit(1)
        .then((result) => {
            if(result.length > 0){
                return res.status(422).send({errorMessage: 'Email is in use'});
            }

            hashPassword(password, (err, hash) => {
                if(err) return next(err);
                password = hash;

                knex.insert({email, password, name, phone_num})
                    .into('merchant')
                    .returning('id')
                    .then((id) => {
                        console.log('hashed pw:', password);
                        //Create and send JWT using the user_id
                        res.json({
                            isSuccess: true,
                            user: {
                                merchant_id: id[0],
                                email, name, phone_num
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
    console.log('req', req);
    res.status(200).json({
        isSuccess: true,
        token: getTokenAtSignIn(req.user.id)
    })
};

exports.token = (req, res, next) => {
    const merchant_id = req.body.merchant_id;
    const tokens = getTokenAtSignIn(merchant_id);
    res.json(tokens);
};

exports.test = (req, res, next) => {
    res.send('cool');
};