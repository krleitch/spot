export { addPasswordReset, getByToken }

const uuid = require('uuid');

const db = require('./mySql');

function addPasswordReset(account_id: string, token: string): Promise<any> {
    var sql = 'INSERT INTO password_reset (id, account_id, creation_date, token) VALUES (?, ?, ?, ?)';
    var values = [uuid.v4(), account_id, new Date(), token];
    return db.query(sql, values);
}

function getByToken(token: string): Promise<any> {
    var sql = 'SELECT account_id, creation_date FROM password_reset WHERE token = ? ORDER BY creation_date DESC LIMIT 1';
    var values = [token];
    return db.query(sql, values);
}
