export { addAccount, getAccountByEmail, getAccountByUsername, deleteAccount, changePassword,
         getAccountById, addFacebookAccount, getFacebookAccount, updateUsername, connectFacebookAccount,
         disconnectFacebookAccount, addAccountMetadata, getAccountMetadata, updateAccountsMetadataDistanceUnit,
         updateAccountsMetadataSearchDistance, updateAccountsMetadataSearchType, verifyAccount, usernameExists,
         getGoogleAccount, addGoogleAccount, updateEmail, updatePhone, connectGoogleAccount, disconnectGoogleAccount,
         updateAccountsMetadataMatureFilter, getAccountByEmailWithPass, getAccountByUsernameWithPass }

const uuid = require('uuid');

// services
const roles = require('@services/authorization/roles');

const db = require('./mySql');

// Metadata

function addAccountMetadata(accountId: string): Promise<any> {
    var sql = `INSERT INTO accounts_metadata (id, account_id, distance_unit, search_type, search_distance, score, mature_filter) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    var values = [uuid.v4(), accountId, 'imperial', 'hot', 'global', 0, true];
    return db.query(sql, values);
}

function getAccountMetadata(accountId: string): Promise<any> {
    var sql = 'SELECT mature_filter, distance_unit, search_type, search_distance, score FROM accounts_metadata WHERE account_id = ?';
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

function updateAccountsMetadataMatureFilter(accountId: string, matureFilter: boolean): Promise<any> {
    var sql = 'UPDATE accounts_metadata SET mature_filter = ? WHERE account_id = ?';
    var values = [matureFilter, accountId];
    return db.query(sql, values);
}

// Account

function addAccount(email: string, username: string, pass: string, phone: string, salt: string): Promise<any> {
    const id = uuid.v4();
    const currentDate = new Date();
    var sql = `INSERT INTO accounts (id, creation_date, email, email_updated_at, username, username_updated_at, 
                pass, phone, phone_updated_at, salt, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var values = [id, currentDate, email, currentDate, username, currentDate, pass, phone, currentDate, salt, false, roles.user];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(id);
    });
}

function getAccountByEmail(email: string): Promise<any> {
    var sql = `SELECT id, email, email_updated_at, username, username_updated_at, phone, local_account,
                 phone_updated_at, facebook_id, google_id, verified_date, creation_date, deletion_date, role
                 FROM accounts WHERE email = ? AND deletion_date IS NULL LIMIT 1`;
    var values = [email];
    return db.query(sql, values);
}

function getAccountByUsername(username: string): Promise<any> {
    var sql = `SELECT id, email, email_updated_at, username, username_updated_at, phone, local_account,
                phone_updated_at, facebook_id, google_id, verified_date, creation_date, deletion_date, role
                FROM accounts WHERE username = ? AND deletion_date IS NULL LIMIT 1`;
    var values = [username];
    return db.query(sql, values);
}

// Should only be used by passport, not returned
function getAccountByEmailWithPass(email: string): Promise<any> {
    var sql = 'SELECT * FROM accounts WHERE email = ? AND deletion_date IS NULL LIMIT 1';
    var values = [email];
    return db.query(sql, values);
}

// Should only be used by passport, not returned
function getAccountByUsernameWithPass(username: string): Promise<any> {
    var sql = 'SELECT * FROM accounts WHERE username = ? AND deletion_date IS NULL LIMIT 1';
    var values = [username];
    return db.query(sql, values);
}

function getAccountById(id: string) {
    var sql = `SELECT id, email, email_updated_at, username, username_updated_at, phone, local_account,
                phone_updated_at, facebook_id, google_id, verified_date, creation_date, deletion_date, role
                FROM accounts WHERE id = ? AND deletion_date IS NULL`;
    var values = [id];
    return db.query(sql, values);
}

function deleteAccount(accountId: string) {
    var sql = 'UPDATE accounts SET deletion_date = ? WHERE id = ?';
    var values = [new Date(), accountId];
    return db.query(sql, values);
}

function updateUsername(username: string, accountId: string) {
    var sql = 'UPDATE accounts SET username = ?, username_updated_at = ? WHERE id = ? AND deletion_date IS NULL';
    var values = [username, new Date(), accountId];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(accountId);
    });;  
}

function usernameExists(username: string) {
    
    var sql = 'SELECT username FROM accounts WHERE username = ? LIMIT 1';
    var values = [username];

    return db.query(sql, values).then( (user: any) => {
        return user.length > 0;
    });

}

function updateEmail(email: string, accountId: string) {
    var sql = 'UPDATE accounts SET email = ?, email_updated_at = ?, verified_date = NULL WHERE id = ? AND deletion_date IS NULL';
    var values = [email, new Date(), accountId];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(accountId);
    });;  
}

function updatePhone(phone: string, accountId: string) {
    var sql = 'UPDATE accounts SET phone = ?, phone_updated_at = ? WHERE id = ? AND deletion_date IS NULL';
    var values = [phone, new Date(), accountId];
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

function verifyAccount( account_id: string, date: Date) {
    var sql = 'UPDATE accounts SET verified_date = ? WHERE id = ? AND deletion_date IS NULL';
    var values = [date, account_id];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(account_id);
    });;  
}

// Facebook
function getFacebookAccount(facebookId: string): Promise<any> {
    var sql = `SELECT id, email, email_updated_at, username, username_updated_at, phone, local_account,
                phone_updated_at, facebook_id, google_id, verified_date, creation_date, deletion_date, role
                FROM accounts WHERE facebook_id = ? AND deletion_date IS NULL LIMIT 1`;
    var values = [facebookId];
    return db.query(sql, values);
}

function addFacebookAccount(id: string, email: string, username: string): Promise<any> {
    var sql = 'INSERT INTO accounts (id, creation_date, email, username, facebook_id, role) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [uuid.v4(), new Date(), email, username, id, roles.user];
    return db.query(sql, values).then( (rows: any) => {
        return getFacebookAccount(id);
    });
}

function connectFacebookAccount(facebookId: string, accountId: string): Promise<any> {
    var sql = 'UPDATE accounts SET facebook_id = ? WHERE id = ?';
    var values = [facebookId, accountId];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(accountId);
    });
}

function disconnectFacebookAccount(accountId: string): Promise<any> {
    var sql = 'UPDATE accounts SET facebook_id = NULL WHERE id = ?';
    var values = [accountId];
    return db.query(sql, values);
}

// Google
function getGoogleAccount(googleId: string): Promise<any> {
    var sql = `SELECT id, email, email_updated_at, username, username_updated_at, phone, local_account,
                phone_updated_at, facebook_id, google_id, verified_date, creation_date, deletion_date, role
                FROM accounts WHERE google_id = ? AND deletion_date IS NULL LIMIT 1`;
    var values = [googleId];
    return db.query(sql, values);
}

function addGoogleAccount(id: string, email: string, username: string): Promise<any> {
    var sql = 'INSERT INTO accounts (id, creation_date, email, username, google_id, role) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [uuid.v4(), new Date(), email, username, id, roles.user];
    return db.query(sql, values).then( (rows: any) => {
        return getGoogleAccount(id);
    });
}

function connectGoogleAccount(googleId: string, accountId: string): Promise<any> {
    var sql = 'UPDATE accounts SET google_id = ? WHERE id = ?';
    var values = [googleId, accountId];
    return db.query(sql, values).then( (rows: any) => {
        return getAccountById(accountId);
    });
}

function disconnectGoogleAccount(accountId: string): Promise<any> {
    var sql = 'UPDATE accounts SET google_id = NULL WHERE id = ?';
    var values = [accountId];
    return db.query(sql, values);
}
