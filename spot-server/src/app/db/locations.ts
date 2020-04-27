export { addLocation, getLatestLocation }

const uuid = require('uuid');

const db = require('./mySql');

function addLocation(account_id: string, latitude: string, longitude: string): Promise<any> {
    var sql = 'INSERT INTO locations (id, account_id, creation_date, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
    var values = [uuid.v4(), account_id, new Date(), latitude, longitude];
    return db.query(sql, values);
}

function getLatestLocation(account_id: string): Promise<any> {
    var sql = 'SELECT latitude, longitude, creation_date FROM locations WHERE account_id = ? ORDER BY creation_date DESC LIMIT 1';
    var values = [account_id];
    return db.query(sql, values);
}
