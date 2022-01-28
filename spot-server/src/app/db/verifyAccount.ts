export { addVerifyAccount, getByToken };

const uuid = require('uuid');

const db = require('./mySql');

function addVerifyAccount(accountId: string, token: string): Promise<any> {
  const sql =
    'INSERT INTO verify_account (id, account_id, creation_date, token) VALUES (?, ?, ?, ?)';
  const values = [uuid.v4(), accountId, new Date(), token];
  return db.query(sql, values);
}

function getByToken(accountId: string, token: string): Promise<any> {
  const sql =
    'SELECT account_id, creation_date FROM verify_account WHERE token = ? AND account_id = ? ORDER BY creation_date DESC LIMIT 1';
  const values = [token, accountId];
  return db.query(sql, values);
}
