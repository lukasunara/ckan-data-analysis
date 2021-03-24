const { Pool } = require("pg");

// created connection pool with the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ckan-data-analysis',
    password: 'bazepodataka',
    port: 5432,
});

// use this method to create queries for the database
// the parameters can be excluded from the method call
module.exports = {
    query: (text, params) => {
        return pool.query(text, params)
            .then(res => {
                return res; // res.rows to get returned rows
            });
    },
    pool: pool
};
