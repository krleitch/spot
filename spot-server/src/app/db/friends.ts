export { getFriendRequests }

const uuid = require('uuid');

const db = require('./mySql');

function getFriendRequests(accountId: string) {
    var sql = `SELECT * FROM friend_requests WHERE receiver = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

