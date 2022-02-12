export default {
  getNotificationByReceiverId,
  getNotificationById,
  addNotification,
  deleteNotificationById,
  addCommentNotification,
  setAllNotificationsSeen,
  setNotificationSeen,
  deleteAllNotificationsForAccount,
  getNotificationUnreadByReceiverId,
  addReplyNotification
};

import uuid from 'uuid';
import { query } from '@db/mySql';

function getNotificationByReceiverId(
  receiverId: string,
  before: Date | null,
  after: Date | null,
  limit: number
) {
  let sql = `SELECT n.id, n.post_id, n.comment_id, n.reply_id, n.creation_date, n.seen, a.username,
                p.image_src, p.image_nsfw, p.content, p.link, p.deletion_date, 
                c.link as comment_link, c.image_src as comment_image_src, c.image_nsfw as comment_image_nsfw, c.content as comment_content, c.account_id as account_id, c.deletion_date as comment_deletion_date,
                r.image_src as reply_image_src, r.image_nsfw as reply_image_nsfw, r.content as reply_content, r.deletion_date as reply_deletion_date, r.link as reply_link
                FROM notifications n
                LEFT JOIN accounts a ON a.id = n.sender_id
                LEFT JOIN posts p ON n.post_id = p.id
                LEFT JOIN comments c ON n.comment_id = c.id
                LEFT JOIN comments r ON n.reply_id = r.id 
                WHERE receiver_id = ? AND c.deletion_date IS NULL AND r.deletion_date IS NULL AND p.deletion_date IS NULL`;
  const values: any = [receiverId];
  if (after) {
    sql += ` AND n.creation_date < ?`;
    values.push(after);
  }
  if (before) {
    sql += ` AND n.creation_date > ?`;
    values.push(before);
  }

  sql += ` ORDER BY n.creation_date DESC LIMIT ?`;
  values.push(limit);
  return query(sql, values);
}

function getNotificationById(id: string) {
  const sql = `SELECT * FROM notifications WHERE id = ?`;
  const values = [id];
  return query(sql, values);
}

function addNotification(senderId: string, receiverId: string, postId: string) {
  const notificationId = uuid.v4();
  const sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id, seen) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [
    notificationId,
    senderId,
    receiverId,
    new Date(),
    postId,
    false
  ];
  return query(sql, values).then((rows: any) => {
    return getNotificationById(notificationId);
  });
}

function addCommentNotification(
  senderId: string,
  receiverId: string,
  postId: string,
  commentId: string
) {
  const notificationId = uuid.v4();
  const sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id, comment_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    notificationId,
    senderId,
    receiverId,
    new Date(),
    postId,
    commentId,
    false
  ];
  return query(sql, values).then((rows: any) => {
    return getNotificationById(notificationId);
  });
}

function addReplyNotification(
  senderId: string,
  receiverId: string,
  postId: string,
  commentId: string,
  replyId: string
) {
  const notificationId = uuid.v4();
  const sql = `Insert INTO notifications (id, sender_id, receiver_id, creation_date, post_id, comment_id, reply_id, seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    notificationId,
    senderId,
    receiverId,
    new Date(),
    postId,
    commentId,
    replyId,
    false
  ];
  return query(sql, values).then((rows: any) => {
    return getNotificationById(notificationId);
  });
}

function setNotificationSeen(notificationId: string, accountId: string) {
  const sql = `UPDATE notifications SET seen = true WHERE id = ? AND receiver_id = ?`;
  const values = [notificationId, accountId];
  return query(sql, values);
}

function setAllNotificationsSeen(accountId: string) {
  const sql = `UPDATE notifications SET seen = true WHERE receiver_id = ?`;
  const values = [accountId];
  return query(sql, values);
}

function deleteNotificationById(id: string, accountId: string) {
  const sql = `DELETE FROM notifications WHERE id = ? AND receiver_id = ?`;
  const values = [id, accountId];
  return query(sql, values);
}

function deleteAllNotificationsForAccount(accountId: string) {
  const sql = `DELETE FROM notifications WHERE receiver_id = ?`;
  const values = [accountId];
  return query(sql, values);
}

function getNotificationUnreadByReceiverId(accountId: string) {
  const sql = `SELECT count(*) as unread 
                FROM notifications n
                LEFT JOIN accounts a ON a.id = n.sender_id
                LEFT JOIN posts p ON n.post_id = p.id
                LEFT JOIN comments c ON n.comment_id = c.id
                LEFT JOIN comments r ON n.reply_id = r.id 
                WHERE receiver_id = ? AND seen = false AND 
                c.deletion_date IS NULL AND r.deletion_date IS NULL AND p.deletion_date IS NULL `;
  const values = [accountId];
  return query(sql, values);
}
