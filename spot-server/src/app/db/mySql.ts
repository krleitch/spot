const mysql = require('mysql');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'rootroot',
  database: 'spot',
  charset: 'utf8mb4'
});

// Initialize the db
function initDb() {
  // db.connect((err: any) => {
  db.getConnection((err: any) => {
    if (err) {
      console.log('Error connecting to MySql');
      return;
    }
    console.log('Connection established to MySql');
  });
}

// Query the db with the sql string
function query(sql: string, args: Array<any>) {
  return new Promise((resolve, reject) => {
    db.query(sql, args, (err: any, results: any) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

// Close the db
function closeDb() {
  return new Promise((resolve, reject) => {
    db.end((err: any) => {
      if (err) {
        return reject(err);
      }
      resolve(true);
    });
  });
}

// return the db object
function getDb() {
  return db;
}

module.exports = {
  initDb,
  closeDb,
  getDb,
  query
};
