import { Connection } from "mysql";

const mysql = require('mysql');

const db: Connection  = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "db"
});

function initDb() {
    db.connect((err) => {
        if(err){
          console.log('Error connecting to MySql');
          return;
        }
        console.log('Connection established to MySql');
    });
}

function query( sql: string, args: Array<any> ) {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}
function closeDb() {
    return new Promise((resolve, reject) => {
        db.end(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function getDb() {
    return db;
}

module.exports = {
    initDb,
    closeDb,
    getDb,
    query
};
