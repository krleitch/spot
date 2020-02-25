export { getNotificationByUsername, getNotificationById, addNotification, deleteNotificationById }

const uuid = require('uuid');

const db = require('./mySql');

function getNotificationByUsername(username: string) {
    var sql = `SELECT * FROM notifications WHERE receiver = ?`;
    var values = [username];
    return db.query(sql, values);
}

function getNotificationById(id: string) {
    var sql = `SELECT * FROM notifications WHERE id = ?`;
    var values = [id];
    return db.query(sql, values);
}

function addNotification(sender: string, receiver: string, postId: string ) {
    var notificationId = uuid.v4();
    var sql = `Insert INTO notifications (id, sender, receiver, creation_date, post_id) VALUES (?, ?, ?, ?, ?)`;
    var values = [notificationId, sender, receiver, new Date(), postId];
    return db.query(sql, values).then ( (rows: any) => {
        return getNotificationById(notificationId);
    });
}

function deleteNotificationById(id: string) {
    var sql = `DELETE FROM notifications where id = ?`;
    var values = [id];
    return db.query(sql, values);
}
