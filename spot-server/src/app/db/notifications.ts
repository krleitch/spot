export { getNotificationByReceiverId, getNotificationById, addNotification, deleteNotificationById, addCommentNotification,
            setAllNotificationsSeen, setNotificationSeen, deleteAllNotificationsForAccount, getNotificationUnreadByReceiverId,
            addReplyNotification }

const uuid = require('uuid');

const db = require('./mySql');

function getNotificationByReceiverId(receiverId: string, before: Date, after: Date, limit: number) {
    var sql = `SELECT n.id, n.post_id, n.comment_id, n.reply_id, n.creation_date, n.seen, a.username,
                p.image_src, p.image_nsfw, p.content, p.link, p.deletion_date, 
                c.link as comment_link, c.image_src as comment_image_src, c.image_nsfw as comment_image_nsfw, c.content as comment_content, c.account_id as account_id, c.deletion_date as comment_deletion_date,
                r.image_src as reply_image_src, r.image_nsfw as reply_image_nsfw, r.content as reply_content, r.deletion_date as reply_deletion_date, r.link as reply_link
                FROM notifications n
                LEFT JOIN accounts a ON a.id = n.sender_id
                LEFT JOIN posts p ON n.post_id = p.id
                LEFT JOIN comments c ON n.comment_id = c.id
                LEFT JOIN comments r ON n.reply_id = r.id 
                WHERE receiver_id = ? AND c.deletion_date IS NULL AND r.deletion_date IS NULL AND p.deletion_date IS NULL`
    var values: any = [receiverId];
    if ( after ) {
        sql += ` AND n.creation_date < ?`;
        values.push(after);
    }
    if ( before ) {
        sql += ` AND n.creation_date > ?`;
        values.push(before);
    }

    sql += ` ORDER BY n.creation_date DESC LIMIT ?`;
    values.push(limit)
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

function setNotificationSeen(notificationId: string, accountId: string) {
    var sql = `UPDATE notifications SET seen = true WHERE id = ? AND receiver_id = ?`;
    var values = [notificationId, accountId];
    return db.query(sql, values);
}

function setAllNotificationsSeen(accountId: string) {
    var sql = `UPDATE notifications SET seen = true WHERE receiver_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

function deleteNotificationById(id: string, accountId: string) {
    var sql = `DELETE FROM notifications WHERE id = ? AND receiver_id = ?`;
    var values = [id, accountId];
    return db.query(sql, values);
}

function deleteAllNotificationsForAccount(accountId: string) {
    var sql = `DELETE FROM notifications WHERE receiver_id = ?`;
    var values = [accountId];
    return db.query(sql, values);
}

function getNotificationUnreadByReceiverId(accountId: string) {
    var sql = `SELECT count(*) as unread 
                FROM notifications n
                LEFT JOIN accounts a ON a.id = n.sender_id
                LEFT JOIN posts p ON n.post_id = p.id
                LEFT JOIN comments c ON n.comment_id = c.id
                LEFT JOIN comments r ON n.reply_id = r.id 
                WHERE receiver_id = ? AND seen = false AND 
                c.deletion_date IS NULL AND r.deletion_date IS NULL AND p.deletion_date IS NULL `;
    var values = [accountId];
    return db.query(sql, values);
}
