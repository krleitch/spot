export { getNotificationByReceiverId, getNotificationById, addNotification, deleteNotificationById,
            setAllNotificationsSeen, setNotificationSeen, deleteAllNotificationsForAccount }

const uuid = require('uuid');

const db = require('./mySql');

function getNotificationByReceiverId(receiverId: string) {
    var sql = `SELECT n.id, n.post_id, n.creation_date, n.seen, a.username, p.image_src, p.content, p.link FROM notifications n LEFT JOIN accounts a ON a.id = n.sender_id
                LEFT JOIN posts p ON n.post_id = p.id WHERE receiver_id = ? ORDER BY n.creation_date DESC`;
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
    var sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id, seen) VALUES (?, ?, ?, ?, ?, ?)`;
    var values = [notificationId, senderId, receiverId, new Date(), postId, false];
    return db.query(sql, values).then ( (rows: any) => {
        return getNotificationById(notificationId);
    });
}

function setNotificationSeen(notificationId: string) {
    var sql = `UPDATE notifications SET seen = true WHERE id = ?`;
    var values = [notificationId];
    return db.query(sql, values);
}

function setAllNotificationsSeen(accountId: string) {
    var sql = `UPDATE notifications SET seen = true WHERE receiver_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

function deleteNotificationById(id: string) {
    var sql = `DELETE FROM notifications where id = ?`;
    var values = [id];
    return db.query(sql, values);
}

function deleteAllNotificationsForAccount(accountId: string) {
    var sql = `DELETE FROM notifications where receiver_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}
