const knex = require('../../knexfile');

const checkStoreOwnership = (storeId, merchantId, callback) => {
    knex.select('*')
        .from('store')
        .where({
            id: storeId,
            merchant_id: merchantId
        })
        .then((store) => {
            if (store.length == 0) {
                console.log('store not owned by this merchant!');
                callback(new Error('stored not owned by merchant'));
            } else {
                callback();
            }
        })
        .catch((error) => {
            callback(error);
        });
};

exports.createMenuCategory = (req, res, next) => {
    const TAG = 'createMenuCategory';
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, name, description} = req.body;
    console.log(`${TAG}:`, storeId, name, description);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) return res.status(400).json({
            success: false,
            errorMessage: "허가되지 않은 접근입니다.",
            error
        });
        console.log(`${TAG}: checkStoreOwnership passed`);

        // Create a new menuCategory, and do a transaction
        // where show_order is updated to id of menuCategory
        knex.transaction((trx) => {
            // Use the transaction object trx
            return knex.transacting(trx)
                .insert({
                    merchant_id: merchantId,
                    store_id: storeId,
                    name,
                    description
                })
                .into('menu_category')
                .returning('id')
                .then((id) => {
                    console.log('INSERT INTO menu_category firt pass');
                    // Return transaction promise
                    return knex('menu_category')
                        .transacting(trx)
                        .update({show_order: id})
                        .where({id});
                })
                .then(trx.commit)
                .catch((error) => {
                    console.log(`${TAG}: transaction error`);
                    trx.rollback();
                    throw error;
                });
        })
            .then(() => {
                console.log(`${TAG}: menuCategory created`);
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
    });
};

exports.getMenuCategories = (req, res, next) => {
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId} = req.body;

    knex.select('*')
        .from('menu_category')
        .where({
            merchant_id: merchantId,
            store_id: storeId
        })
        .orderBy('show_order', 'asc')
        .then((menuCategories) => {
            console.log('menuCategories:', menuCategories);
            res.status(200).json({
                success: true,
                menuCategories
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

exports.getMenuItems = (req, res, next) => {
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {categoryId} = req.body;

    knex.select('*')
        .from('menu')
        .where({
            merchant_id: merchantId,
            category_id: categoryId
        })
        .orderBy('show_order', 'asc')
        .then((menuItems) => {
            console.log('menuItems:', menuItems);
            res.status(200).json({
                success: true,
                menuItems
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