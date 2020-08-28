const mysql = require('mysql');

// const db: Connection  = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "admin",
//     database: "db",
//     charset : 'utf8mb4'
// });
// root / rootroot
// KEEP CONNECTION OPEN

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'db',
    charset : 'utf8mb4'
  });

// KEEP CONNECTION OPEN

function initDb() {
    // db.connect((err: any) => {
    db.getConnection((err: any) => {
        if(err){
          console.log('Error connecting to MySql');
          return;
        }
        console.log('Connection established to MySql');
    });
}

function query( sql: string, args: Array<any> ) {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err: any, results: any) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}
function closeDb() {
    return new Promise((resolve, reject) => {
        db.end((err: any) => {
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
