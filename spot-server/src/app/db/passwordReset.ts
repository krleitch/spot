export default { addPasswordReset, getByToken };

import uuid from 'uuid';
import { query } from '@db/mySql.js';

function addPasswordReset(account_id: string, token: string): Promise<any> {
  const sql =
    'INSERT INTO password_reset (id, account_id, creation_date, token) VALUES (?, ?, ?, ?)';
  const values = [uuid.v4(), account_id, new Date(), token];
  return query(sql, values);
}

function getByToken(token: string): Promise<any> {
  const sql =
    'SELECT account_id, creation_date FROM password_reset WHERE token = ? ORDER BY creation_date DESC LIMIT 1';
  const values = [token];
  return query(sql, values);
}
