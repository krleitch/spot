export { getNotificationByReceiverId, getNotificationById, addNotification, deleteNotificationById, addCommentNotification,
            setAllNotificationsSeen, setNotificationSeen, deleteAllNotificationsForAccount, getNotificationUnreadByReceiverId }

const uuid = require('uuid');

const db = require('./mySql');

function getNotificationByReceiverId(receiverId: string, offset: number, limit: number) {
    var sql = `SELECT n.id, n.post_id, n.comment_id, n.creation_date, n.seen, a.username,
                p.image_src, p.content, p.link, 
                c.link as comment_link, c.image_src as comment_image_src, c.content as comment_content,
                r.image_src as reply_image_src, r.content as reply_content
                FROM notifications n
                LEFT JOIN accounts a ON a.id = n.sender_id
                LEFT JOIN posts p ON n.post_id = p.id
                LEFT JOIN comments c ON n.comment_id = c.id
                LEFT JOIN comments r ON n.reply_id = r.id WHERE receiver_id = ?
                ORDER BY n.creation_date DESC LIMIT ? OFFSET ?`;
    var values = [receiverId, limit, offset];
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

function addCommentNotification(senderId: string, receiverId: string, postId: string, commentId: string ) {
    var notificationId = uuid.v4();
    var sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id, comment_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    var values = [notificationId, senderId, receiverId, new Date(), postId, commentId, false];
    return db.query(sql, values).then ( (rows: any) => {
        return getNotificationById(notificationId);
    });
}

function addReplyNotification(senderId: string, receiverId: string, postId: string, commentId: string, replyId: string ) {
    var notificationId = uuid.v4();
    var sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id, comment_id, reply_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    var values = [notificationId, senderId, receiverId, new Date(), postId, commentId, replyId, false];
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
    var sql = `DELETE FROM notifications WHERE id = ?`;
    var values = [id];
    return db.query(sql, values);
}

function deleteAllNotificationsForAccount(accountId: string) {
    var sql = `DELETE FROM notifications WHERE receiver_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

function getNotificationUnreadByReceiverId(accountId: string) {
    var sql = `SELECT count(*) as unread FROM notifications WHERE receiver_id = ? AND seen = false`;
    var values = [accountId];
    return db.query(sql, values);
}
