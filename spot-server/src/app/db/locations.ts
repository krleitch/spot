export default { addLocation, getLatestLocation, updateLocation };

import uuid from 'uuid';
import { query } from '@db/mySql';

function addLocation(
  account_id: string,
  latitude: number,
  longitude: number
): Promise<any> {
  const sql =
    'INSERT INTO locations (id, account_id, creation_date, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
  const values = [uuid.v4(), account_id, new Date(), latitude, longitude];
  return query(sql, values);
}

function updateLocation(
  account_id: string,
  latitude: number,
  longitude: number
): Promise<any> {
  const sql =
    'UPDATE locations SET latitude = ?, longitude = ?, creation_date = ? WHERE account_id = ?';
  const values = [latitude, longitude, new Date(), account_id];
  return query(sql, values);
}

function getLatestLocation(account_id: string): Promise<any> {
  const sql =
    'SELECT latitude, longitude, creation_date FROM locations WHERE account_id = ? ORDER BY creation_date DESC LIMIT 1';
  const values = [account_id];
  return query(sql, values);
}
