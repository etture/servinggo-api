const express = require('express');
const knex = require('../../knexfile');

// Endpoint: /api/store
const router = express.Router();

// TODO socket.io implementation with merchant client to have table interaction
// TODO also with customer client
router.post('/store_page', (req, res) => {
    const {store_id, table_num} = req.body;

    // SELECT name FROM store WHERE id = ${store_id} LIMIT 1
    knex.select('name')
        .from('store')
        .where({id: store_id})
        .limit(1)
        .then((store) => {
            res.json({
                store_name: store[0].name,
                table_num
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        })
});

module.exports = router;