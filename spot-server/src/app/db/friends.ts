export { getFriends, getFriendRequests, addFriendRequest, acceptFriendRequest, declineFriendRequest }

const uuid = require('uuid');

const db = require('./mySql');

// use a union because friends are a 1 row mutual relationship
function getFriends(accountId: string) {
    var sql = `SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.friend_id = accounts.id WHERE account_id = ? AND friends.confirmed_date IS NOT NULL
                UNION
                SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.account_id = accounts.id WHERE friend_id = ? AND friends.confirmed_date IS NOT NULL`;
    var values = [accountId, accountId];
    return db.query(sql, values);
}

// friend requests, account_id is the one who sent the request
function getFriendRequests(accountId: string) {
    var sql = `SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.account_id = accounts.id WHERE friend_id = ? AND friends.confirmed_date IS NULL`;
    var values = [accountId, accountId];
    return db.query(sql, values);
}

function getFriendsById(id: string) {
    var sql = `SELECT * FROM friends WHERE id = ?`;
    var values = [id];
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
    return db.query(sql, values);
}

function declineFriendRequest(id: string, accountId: string) {
    var sql = `DELETE * FROM friends WHERE id = ? AND friend_id = ? AND confirmed_date IS NULL`;
    var values = [new Date(), id, accountId];
    return db.query(sql, values);
}
