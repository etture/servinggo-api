const knex = require('../../knexfile');

exports.createNewStore = (req, res, next) => {
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    // POST request body
    const {name, phoneNum, address, accountNum} = req.body;

    // INSERT INTO `store` (merchant_id, name, phone_num, address, account_num) VALUES (...);
    knex.insert({
        merchant_id: merchantId,
        name,
        phone_num: phoneNum,
        address,
        account_num: accountNum})
        .into('store')
        .then(() => {
            res.status(200).json({
                success: true
            });
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                error
            });
        });
};

exports.getStores = (req, res, next) => {
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;

    knex.select('*')
        .from('store')
        .where({merchant_id: merchantId})
        .orderBy('id', 'asc')
        .then((stores) => {
            const numOfStores = stores.length;
            res.status(200).json({
                success: true,
                numOfStores,
                stores
            })
        })
        .catch((error) => {
            res.status(400).json({
                success: false,
                errorMessage: "에러가 발생했습니다. 다시 시도해주세요!",
                error
            })
        });
};