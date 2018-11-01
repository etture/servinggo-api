const connection = process.env.JAWSDB_URL || require('./local/mysql_connection');

const knex = require('knex')({
    client: 'mysql',
    connection
});

// Check DB connection
knex.raw("SELECT 'test connection';").then((message) => {
    console.log('DB connected!');
}).catch((err) => {
    throw err;
});

module.exports = knex;