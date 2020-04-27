export { addAccount, getAccountByEmail, getAccountByUsername, deleteAccount, changePassword,
         getAccountById, addFacebookAccount, getFacebookAccount, updateUsername }

const uuid = require('uuid');

const db = require('./mySql');

function addAccount(email: string, username: string, pass: string, phone: string, salt: string): Promise<any> {
    var sql = 'INSERT INTO accounts (id, creation_date, email, username, pass, phone, score, salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [uuid.v4(), new Date(), email, username, pass, phone, 0, salt, false];
    return db.query(sql, values);
}

function getFacebookAccount(facebookId: string): Promise<any> {
    var sql = 'SELECT * FROM accounts WHERE facebook_id = ? AND deletion_date IS NULL';
    var values = [facebookId];
    return db.query(sql, values);
}

function addFacebookAccount(id: string, email: string): Promise<any> {
    const index = email.indexOf('@');
    // TODO THIS IS A BAD USERNAME GENERATOR
    var username = email.substring(0, index);
    var sql = 'INSERT INTO accounts (id, email, username, facebook_id, score) VALUES (?, ?, ?, ?, ?)';
    var values = [uuid.v4(), email, username, id, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getFacebookAccount(id);
    });
}

// TODO, wanna change from *
function getAccountByEmail(email: string): Promise<any> {
    var sql = 'SELECT * FROM accounts WHERE email = ? AND deletion_date IS NULL';
    var values = [email];
    return db.query(sql, values);
}

function getAccountByUsername(username: string): Promise<any> {
    var sql = 'SELECT * FROM accounts WHERE username = ? AND deletion_date IS NULL';
    var values = [username];
    return db.query(sql, values);
}

function getAccountById(id: string) {
    var sql = 'SELECT * FROM accounts WHERE id = ? AND deletion_date IS NULL';
    var values = [id];
    return db.query(sql, values);
}

function deleteAccount(accountId: string) {
    var sql = 'UPDATE accounts SET deletion_date = ? WHERE id = ?';
    var values = [new Date(), accountId];
    return db.query(sql, values);
}

function updateUsername(username: string, accountId: string) {
    var sql = 'UPDATE accounts SET username = ? WHERE id = ? AND deletion_date IS NULL';
    var values = [username, accountId];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(accountId);
    });;  
}

function changePassword( account_id: string, password: string, salt: string) {
    var sql = 'UPDATE accounts SET pass = ?, salt = ? WHERE id = ? AND deletion_date IS NULL';
    var values = [password, salt, account_id];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(account_id);
    });;  
}
