const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

let db;

const initializeDatabase = async () => { 
    db = await open({
        filename: './database/travelplanner.db',
        driver: sqlite3.Database
    });
    return db;
};
module.exports = initializeDatabase;