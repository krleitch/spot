export { getFriends, getFriendRequests, addFriendRequest, acceptFriendRequest, declineFriendRequest, deleteFriendById,
            friendRequestExists, getFriendsExist, getPendingFriendRequests }

const uuid = require('uuid');

const db = require('./mySql');

// use a union because friends are a 1 row mutual relationship
function getFriends(accountId: string, date: string, limit: string) {
    const selectSql = `SELECT id, creation_date, username, confirmed_date FROM
                (SELECT friends.id, friends.creation_date, friends.confirmed_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.friend_id = accounts.id WHERE account_id = ? AND friends.confirmed_date IS NOT NULL
                UNION
                SELECT friends.id, friends.creation_date, friends.confirmed_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.account_id = accounts.id WHERE friend_id = ? AND friends.confirmed_date IS NOT NULL) results
                WHERE confirmed_date < ? ORDER BY confirmed_date DESC`;
    var values = [accountId, accountId, new Date(date)];
    var limitSql = '';       
    if ( limit ) {
        limitSql = ` LIMIT ?`
        values =  [accountId, accountId, new Date(date), limit]
    }
    const sql = selectSql + limitSql;

    return db.query(sql, values);
}

function getFriendsExist(firstId: string, secondId: string) {
    const sql = `SELECT * FROM 
                 (SELECT * FROM friends WHERE account_id = ? AND friend_id = ? AND confirmed_date IS NOT NULL
                  UNION
                  SELECT * FROM friends WHERE account_id = ? and friend_id = ? AND confirmed_date IS NOT NULL) results LIMIT 1`;
    const values = [firstId, secondId, secondId, firstId];
    return db.query(sql, values);
}

// delete friend
function deleteFriendById(id: string, accountId: string) {
    var sql = `DELETE FROM friends WHERE id = ? AND (account_id = ? OR friend_id = ?)`;
    var values = [id, accountId, accountId];
    return db.query(sql, values);
}

// friend requests, account_id is the one who sent the request
function getFriendRequests(accountId: string) {
    var sql = `SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.account_id = accounts.id WHERE friend_id = ? AND friends.confirmed_date IS NULL`;
    var values = [accountId];
    return db.query(sql, values);
}

// return sent but not yet accepted
function getPendingFriendRequests(accountId: string) {
    var sql = `SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.friend_id = accounts.id WHERE account_id = ? AND friends.confirmed_date IS NULL`;
    var values = [accountId];
    return db.query(sql, values);
}

function getFriendsById(id: string) {
    var sql = `SELECT * FROM friends WHERE id = ?`;
    var values = [id];
    return db.query(sql, values);
}

// Check if you have a friend request from account friendId
function friendRequestExists(friendId: string, accountId: string) {
    var sql = `Select id, account_id FROM friends WHERE (account_id = ? OR account_id = ?) AND confirmed_date IS NULL`;
    var values = [friendId, accountId];
    return db.query(sql, values);
}

function addFriendRequest(senderId: string, receiverId: string) {
    var friendRequestId = uuid.v4();
    var sql = `Insert INTO friends (id, account_id, friend_id, creation_date, confirmed_date) VALUES (?, ?, ?, ?, ?)`;
    var values = [friendRequestId, senderId, receiverId, new Date(), null];
    return db.query(sql, values).then ( (rows: any) => {
        return getFriendsById(friendRequestId);
    });
}

// function deleteFriendRequestsByReceiverId(id: string, accountId: string) {
//     var sql = `DELETE FROM friend_requests WHERE id = ? AND receiver_id = ?`;
//     var values = [id, accountId];
//     return db.query(sql, values);
// }

function acceptFriendRequest(id: string, accountId: string) {
    var sql = `UPDATE friends SET confirmed_date = ? WHERE id = ? AND friend_id = ? AND confirmed_date IS NULL`;
    var values = [new Date(), id, accountId];
    return db.query(sql, values).then( (rows: any) => {
        return getFriendsById(id);
    });
}

function declineFriendRequest(id: string, accountId: string) {
    var sql = `DELETE FROM friends WHERE id = ? AND friend_id = ? AND confirmed_date IS NULL`;
    var values = [id, accountId];
    return db.query(sql, values);
}
