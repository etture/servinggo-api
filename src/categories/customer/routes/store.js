const express = require('express');
const knex = require('../../../utils/knexfile');

// Endpoint: /api/store
const router = express.Router();

// TODO socket.io implementation with merchant client to have table interaction
// TODO also with customer client
router.post('/store_page', (req, res) => {
    const {store_id: storeId, table_num: tableNum} = req.body;

    // SELECT name FROM store WHERE id = ${storeId} LIMIT 1
    knex.select('name')
        .from('store')
        .where({id: storeId})
        .limit(1)
        .then((store) => {
            res.json({
                store_name: store[0].name,
                table_num: tableNum
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        })
});

module.exports = router;