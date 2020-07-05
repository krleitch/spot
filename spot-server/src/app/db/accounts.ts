export { addAccount, getAccountByEmail, getAccountByUsername, deleteAccount, changePassword,
         getAccountById, addFacebookAccount, getFacebookAccount, updateUsername, connectFacebookAccount,
         disconnectFacebookAccount, addAccountMetadata, getAccountMetadata, updateAccountsMetadataDistanceUnit,
         updateAccountsMetadataSearchDistance, updateAccountsMetadataSearchType, verifyAccount  }

const uuid = require('uuid');
const roles = require('@services/authorization/roles');

const db = require('./mySql');

function addAccountMetadata(accountId: string): Promise<any> {
    var sql = `INSERT INTO accounts_metadata (id, account_id, distance_unit, search_type, search_distance, score) VALUES (?, ?, ?, ?, ?, ?)`;
    var values = [uuid.v4(), accountId, 'miles', 'hot', 'global', 0];
    return db.query(sql, values);
}

function getAccountMetadata(accountId: string): Promise<any> {
    var sql = 'SELECT distance_unit, search_type, search_distance, score FROM accounts_metadata WHERE account_id = ?';
    var values = [accountId];
    return db.query(sql, values);
}

function updateAccountsMetadataDistanceUnit(accountId: string, distanceUnit: string): Promise<any> {
    var sql = 'UPDATE accounts_metadata SET distance_unit = ? WHERE account_id = ?';
    var values = [distanceUnit, accountId];
    return db.query(sql, values);
}

function updateAccountsMetadataSearchDistance(accountId: string, searchDistance: string): Promise<any> {
    var sql = 'UPDATE accounts_metadata SET search_distance = ? WHERE account_id = ?';
    var values = [searchDistance, accountId];
    return db.query(sql, values);
}

function updateAccountsMetadataSearchType(accountId: string, searchType: string): Promise<any> {
    var sql = 'UPDATE accounts_metadata SET search_type = ? WHERE account_id = ?';
    var values = [searchType, accountId];
    return db.query(sql, values);
}

function addAccount(email: string, username: string, pass: string, phone: string, salt: string): Promise<any> {
    const id = uuid.v4();
    var sql = 'INSERT INTO accounts (id, creation_date, email, username, pass, phone, salt, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [id, new Date(), email, username, pass, phone, salt, false, roles.user];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(id);
    });
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
    var sql = 'INSERT INTO accounts (id, email, username, facebook_id, role) VALUES (?, ?, ?, ?, ?)';
    var values = [uuid.v4(), email, username, id, roles.user];
    return db.query(sql, values).then( (rows: any) => {
        return getFacebookAccount(id);
    });
}

function connectFacebookAccount(facebookId: string, accountId: string): Promise<any> {
    var sql = 'UPDATE accounts SET facebook_id = ? WHERE id = ?';
    var values = [facebookId, accountId];
    return db.query(sql, values);
}

function disconnectFacebookAccount(accountId: string): Promise<any> {
    var sql = 'UPDATE accounts SET facebook_id = NULL WHERE id = ?';
    var values = [accountId];
    return db.query(sql, values);
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

function verifyAccount( account_id: string) {
    var sql = 'UPDATE accounts SET verified_date = ? WHERE id = ? AND deletion_date IS NULL';
    var values = [new Date(), account_id];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(account_id);
    });;  
}
