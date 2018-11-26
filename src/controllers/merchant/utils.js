const knex = require('../../knexfile');

// Function to check store ownership
// Compare merchant_id and store_id of store to values passed to endpoint
export const checkStoreOwnership = (storeId, merchantId, callback) => {
    knex.select('*')
        .from('store')
        .where({
            id: storeId,
            merchant_id: merchantId
        })
        .then((store) => {
            if (store.length === 0) {
                console.log('store not owned by this merchant!');
                callback(new Error('stored not owned by merchant'));
            } else {
                // Pass
                callback();
            }
        })
        .catch((error) => {
            console.log('catch에서 에러 검출');
            callback(error);
        });
};