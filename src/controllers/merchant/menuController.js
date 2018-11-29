const knex = require('../../utils/knexfile');
const {checkStoreOwnership} = require('./utils');

// Create a new menuCategory
// DONE
exports.createMenuCategory = (req, res, next) => {
    const TAG = 'createMenuCategory';
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, name, description} = req.body;

    console.log(`${TAG}:`, storeId, name, description);

    checkStoreOwnership(storeId, merchantId, (error) => {
        console.log(`${TAG}, error:`, error);
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        let categoryId = 0;

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
                    console.log('INSERT INTO menu_category first pass');
                    categoryId = id[0];
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

                // Return success message and categoryId of the new category in the response
                res.status(200).json({
                    success: true,
                    categoryId
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

// Create a new menu item for a particular category
// DONE
exports.createMenuItem = (req, res, next) => {
    const TAG = 'createMenuItem';
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, categoryId, name, description, priceKrw} = req.body;
    console.log(`${TAG}:`, categoryId, name, description, priceKrw);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        let menuId = 0;

        // Create a new menuCategory, and do a transaction
        // where show_order is updated to id of menuCategory
        knex.transaction((trx) => {
            // Use the transaction object trx
            return knex.transacting(trx)
                .insert({
                    merchant_id: merchantId,
                    category_id: categoryId,
                    name,
                    description,
                    price_krw: priceKrw
                })
                .into('menu')
                .returning('id')
                .then((id) => {
                    console.log('INSERT INTO menu first pass');
                    menuId = id[0];
                    // Return transaction promise
                    return knex('menu')
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
                console.log(`${TAG}: menuItem created`);
                res.status(200).json({
                    success: true,
                    menuId
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

// Get a list of menu categories for a particular store
// DONE
exports.getMenuCategories = (req, res, next) => {
    const TAG = 'getMenuCategories';
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId} = req.body;

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

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
    });
};

// Get a list of menu items for a particular menu category
// DONE
exports.getMenuItems = (req, res, next) => {
    const TAG = 'getMenuItems';
    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, categoryId} = req.body;
    console.log(`${TAG} body:`, storeId, categoryId);

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

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
    });
};

exports.deleteMenuCategory = (req, res, next) => {
    const TAG = 'deleteMenuCategory';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, categoryId} = req.body;

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);
    });
};

exports.deleteMenuCategory = (req, res, next) => {
    const TAG = 'deleteMenuCategory';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, categoryId} = req.body;

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        knex('menu_category')
            .delete()
            .where('id', categoryId)
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
    });
};

exports.deleteMenuItem = (req, res, next) => {
    const TAG = 'deleteMenuItem';

    // Get merchantId from accessToken after passport authentication
    const {id: merchantId} = req.user;
    const {storeId, menuId} = req.body;

    checkStoreOwnership(storeId, merchantId, (error) => {
        if (error) {
            res.status(400).json({
                success: false,
                errorMessage: "허가되지 않은 접근입니다.",
                error
            });
            return;
        }
        console.log(`${TAG}: checkStoreOwnership passed`);

        knex('menu')
            .delete()
            .where('id', menuId)
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
    });
};
