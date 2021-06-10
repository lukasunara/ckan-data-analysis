const { Pool } = require("pg");

// created connection pool with the database
const pool = new Pool({
    user: 'postgres', // here should be postgres or name of user which has access to database 
    host: 'localhost', // here should be localhost
    database: 'name', // here comes database name
    password: 'password', // here comes database password
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
