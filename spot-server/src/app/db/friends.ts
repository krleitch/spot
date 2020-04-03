export { getFriends, getFriendRequests, getFriendRequestsById, addFriendRequest }

const uuid = require('uuid');

const db = require('./mySql');

// easier to get both ids, and then make another query for the username we actually need
function getFriends(accountId: string) {
    var sql = `SELECT id, requester_id, acceptor_id, creation_date FROM friends 
                WHERE acceptor_id = ? OR requester_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

function getFriendRequests(accountId: string) {
    var sql = `SELECT friend_requests.id, friend_requests.creation_date, accounts.username FROM friend_requests 
                LEFT JOIN accounts ON friend_requests.sender_id = accounts.id WHERE receiver_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

function getFriendRequestsById(id: string) {
    var sql = `SELECT * FROM friend_requests WHERE id = ?`;
    var values = [id];
    return db.query(sql, values);
}

function addFriendRequest(senderId: string, receiverId: string) {
    var friendRequestId = uuid.v4();
    var sql = `Insert INTO friend_requests (id, sender_id, receiver_id, creation_date) VALUES (?, ?, ?, ?)`;
    var values = [friendRequestId, senderId, receiverId, new Date()];
    return db.query(sql, values).then ( (rows: any) => {
        return getFriendRequestsById(friendRequestId);
    });
}

// function deleteFriendRequestsByReceiverId(id: string, accountId: string) {
//     var sql = `DELETE FROM friend_requests WHERE id = ? AND receiver_id = ?`;
//     var values = [id, accountId];
//     return db.query(sql, values);
// }

function addFriend(id: string, accountId: string) {
    var sql = `DELETE FROM friend_requests WHERE id = ? AND sender_id = ?`;
    var values = [id, accountId];
    return db.query(sql, values);
}
