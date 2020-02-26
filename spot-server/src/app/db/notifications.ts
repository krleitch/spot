export { getNotificationByReceiverId, getNotificationById, addNotification, deleteNotificationById }

const uuid = require('uuid');

const db = require('./mySql');

function getNotificationByReceiverId(receiverId: string) {
    var sql = `SELECT n.id, n.post_id, n.creation_date, a.username FROM notifications n LEFT JOIN accounts a ON a.id = n.sender_id WHERE receiver_id = ?`;
    var values = [receiverId];
    return db.query(sql, values);
}

function getNotificationById(id: string) {
    var sql = `SELECT * FROM notifications WHERE id = ?`;
    var values = [id];
    return db.query(sql, values);
}

function addNotification(senderId: string, receiverId: string, postId: string ) {
    var notificationId = uuid.v4();
    var sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id) VALUES (?, ?, ?, ?, ?)`;
    var values = [notificationId, senderId, receiverId, new Date(), postId];
    return db.query(sql, values).then ( (rows: any) => {
        return getNotificationById(notificationId);
    });
}

function deleteNotificationById(id: string) {
    var sql = `DELETE FROM notifications where id = ?`;
    var values = [id];
    return db.query(sql, values);
}
