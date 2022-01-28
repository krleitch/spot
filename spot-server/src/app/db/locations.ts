export { addLocation, getLatestLocation, updateLocation };

const uuid = require('uuid');

const db = require('./mySql');

function addLocation(
  account_id: string,
  latitude: string,
  longitude: string
): Promise<any> {
  const sql =
    'INSERT INTO locations (id, account_id, creation_date, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
  const values = [uuid.v4(), account_id, new Date(), latitude, longitude];
  return db.query(sql, values);
}

function updateLocation(
  account_id: string,
  latitude: string,
  longitude: string
): Promise<any> {
  const sql =
    'UPDATE locations SET latitude = ?, longitude = ?, creation_date = ? WHERE account_id = ?';
  const values = [latitude, longitude, new Date(), account_id];
  return db.query(sql, values);
}

function getLatestLocation(account_id: string): Promise<any> {
  const sql =
    'SELECT latitude, longitude, creation_date FROM locations WHERE account_id = ? ORDER BY creation_date DESC LIMIT 1';
  const values = [account_id];
  return db.query(sql, values);
}
