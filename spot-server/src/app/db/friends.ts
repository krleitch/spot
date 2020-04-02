export { getFriendRequests, getFriendRequestsById, addFriendRequest, deleteFriendRequestsById }

const uuid = require('uuid');

const db = require('./mySql');

function getFriendRequests(accountId: string) {
    var sql = `SELECT * FROM friend_requests WHERE receiver = ?`;
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

function deleteFriendRequestsById(id: string, accountId: string) {
    var sql = `DELETE FROM friend_requests WHERE id = ? AND sender_id = ?`;
    var values = [id, accountId];
    return db.query(sql, values);
}

