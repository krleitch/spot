export default {
  addComment,
  deleteCommentById,
  deleteReplyByParentId,
  getCommentByPostId,
  getNumberOfRepliesForCommentAfterDate,
  getNumberOfRepliesForComment,
  addReply,
  getRepliesByCommentId,
  getNumberOfCommentsForPost,
  getRepliesUpToDate,
  likeComment,
  dislikeComment,
  getCommentsActivity,
  getCommentById,
  getCommentByLink,
  getNumberOfCommentsForPostAfterDate,
  getNumberOfCommentsForPostBeforeDate,
  getCommentByPostIdNoAccount,
  getCommentByIdNoAccount,
  linkExists,
  unratedComment,
  checkOwned,
  updateNsfw
};

import uuid from 'uuid';

// db
import { query } from '@db/mySql.js';

// constants
import { COMMENTS_CONSTANTS } from '@constants/comments.js';

// Used for getting a comment or reply
function getCommentById(commentId: string, accountId: string): Promise<any> {
  const sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.comment_parent_id, comments.link,
        (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
            WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
            ELSE NULL END) AS rated,
        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.id = ? AND comments.deletion_date IS NULL GROUP BY comments.id`;
  const values = [accountId, accountId, accountId, commentId];
  return query(sql, values);
}

function getCommentByIdNoAccount(commentId: string): Promise<any> {
  const sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.id = ? AND comments.deletion_date IS NULL GROUP BY comments.id`;
  const values = [commentId];
  return query(sql, values);
}

// postId, accountId, date, limit, type
// Used for getting just the comments of a post
function getCommentByPostId(
  postId: string,
  date: string,
  limit: number,
  type: string,
  accountId: string
): Promise<any> {
  const selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link`;

  let accountSql = '';
  let accountValues: any[] = [];
  if (accountId) {
    accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`;
    accountValues = [accountId, accountId, accountId];
  }

  const joinSql = ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id
                        WHERE comments.post_id = ? AND comments.parent_id IS NULL AND comments.deletion_date IS NULL `;

  let orderSql;
  if (type == 'after') {
    orderSql = ` AND comments.creation_date > ? GROUP BY comments.id ORDER BY comments.creation_date ASC LIMIT ? `;
  } else {
    orderSql = `  AND comments.creation_date < ? GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? `;
  }

  const sql = selectSql + accountSql + joinSql + orderSql;
  const values = accountValues.concat([postId, new Date(date), limit]);
  return query(sql, values);
}

function getCommentByPostIdNoAccount(
  postId: string,
  date: string,
  limit: number,
  type: string
): Promise<any> {
  const selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id
        WHERE comments.post_id = ? AND comments.parent_id IS NULL AND comments.deletion_date IS NULL `;

  let orderSql;
  if (type == 'after') {
    orderSql = ` AND comments.creation_date > ? GROUP BY comments.id ORDER BY comments.creation_date ASC LIMIT ? `;
  } else {
    orderSql = `  AND comments.creation_date < ? GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? `;
  }

  const sql = selectSql + orderSql;
  const values = [postId, new Date(date), limit];
  return query(sql, values);
}

function addComment(
  commentId: string,
  postId: string,
  accountId: string,
  content: string,
  image: string,
  imageNsfw: boolean,
  link: string,
  commentParentId: string
): Promise<any> {
  // Note the parent_id is NULL
  const sql =
    'INSERT INTO comments (id, post_id, account_id, creation_date, comment_parent_id, content, link, image_src, image_nsfw, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    commentId,
    postId,
    accountId,
    new Date(),
    commentParentId,
    content,
    link,
    image,
    imageNsfw,
    0,
    0
  ];
  return query(sql, values).then((rows: any) => {
    return getCommentById(commentId, accountId);
  });
}

function deleteCommentById(commentId: string): Promise<any> {
  const sql = 'UPDATE comments SET deletion_date = ? WHERE id = ?';
  const values = [new Date(), commentId];
  return query(sql, values);
}

function deleteReplyByParentId(parentId: string): Promise<any> {
  const sql = 'UPDATE comments SET deletion_date = ? WHERE parent_id = ?';
  const values = [new Date(), parentId];
  return query(sql, values);
}

// Add a reply
function addReply(
  replyId: string,
  postId: string,
  commentId: string,
  commentParentId: string,
  accountId: string,
  content: string,
  image: string,
  imageNsfw: boolean,
  link: string
): Promise<any> {
  const sql =
    'INSERT INTO comments (id, post_id, parent_id, comment_parent_id, account_id, creation_date, content, link, image_src, image_nsfw, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    replyId,
    postId,
    commentId,
    commentParentId,
    accountId,
    new Date(),
    content,
    link,
    image,
    imageNsfw,
    0,
    0
  ];
  return query(sql, values).then((rows: any) => {
    return getCommentById(replyId, accountId);
  });
}

// Used for getting just the comments of a post
function getRepliesByCommentId(
  postId: string,
  commentId: string,
  date: string,
  limit: number,
  accountId?: string
): Promise<any> {
  const selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link`;

  let accountSql = '';
  let replyValues: any[] = [];
  if (accountId) {
    accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`;
    replyValues = replyValues.concat([accountId, accountId, accountId]);
  }

  const joinSql = ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
                    WHERE comments.post_id = ? AND comments.parent_id = ? AND comments.deletion_date IS NULL `;
  replyValues = replyValues.concat([postId, commentId]);

  let dateSql = ``;
  if (date) {
    dateSql = `AND comments.creation_date > ? `;
    replyValues = replyValues.concat([new Date(date)]);
  }

  const orderSql = `GROUP BY comments.id ORDER BY comments.creation_date ASC LIMIT ?`;
  const sql = selectSql + accountSql + joinSql + dateSql + orderSql;
  replyValues = replyValues.concat([limit]);
  return query(sql, replyValues);
}

// Used for getting just the comments of a post
function getRepliesUpToDate(
  postId: string,
  commentId: string,
  date: string,
  accountId?: string
): Promise<any> {
  const selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link`;

  let accountSql = '';
  let values: any[] = [];
  if (accountId) {
    accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`;
    values = values.concat([accountId, accountId, accountId]);
  }

  const joinSql = ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
                    WHERE comments.post_id = ? AND comments.parent_id = ? AND comments.deletion_date IS NULL `;
  values = values.concat([postId, commentId]);

  const dateSql = `AND comments.creation_date <= ? `;
  values = values.concat([new Date(date)]);

  const orderSql = `GROUP BY comments.id ORDER BY comments.creation_date ASC`;
  const sql = selectSql + accountSql + joinSql + dateSql + orderSql;
  return query(sql, values);
}

// Return the number of comments
function getNumberOfCommentsForPost(postId: string): Promise<any> {
  const sql =
    'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND deletion_date IS NULL AND parent_id IS NULL';
  const values = [postId];
  return query(sql, values);
}

// Return the number of comments before a date
function getNumberOfCommentsForPostBeforeDate(
  postId: string,
  date: string
): Promise<any> {
  const sql =
    'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND deletion_date IS NULL AND parent_id IS NULL AND creation_date < ?';
  const values = [postId, new Date(date)];
  return query(sql, values);
}

function getNumberOfCommentsForPostAfterDate(
  postId: string,
  date: string
): Promise<any> {
  const sql =
    'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND deletion_date IS NULL AND parent_id IS NULL AND creation_date > ?';
  const values = [postId, new Date(date)];
  return query(sql, values);
}

function getNumberOfRepliesForCommentAfterDate(
  postId: string,
  commentId: string,
  date: string
): Promise<any> {
  const sql =
    'SELECT COUNT(*) as total FROM comments WHERE post_id = ? and parent_id = ? AND deletion_date IS NULL AND creation_date > ?';
  const values = [postId, commentId, new Date(date)];
  return query(sql, values);
}

// Return the number of replies for comment for post
function getNumberOfRepliesForComment(
  postId: string,
  commentId: string
): Promise<any> {
  const sql =
    'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND parent_id = ? AND deletion_date IS NULL';
  const values = [postId, commentId];
  return query(sql, values);
}

function likeComment(commentId: string, accountId: string): Promise<any> {
  const sql =
    'INSERT INTO comments_rating (id, comment_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 1';
  const values = [uuid.v4(), commentId, accountId, 1];
  return query(sql, values);
}

function dislikeComment(commentId: string, accountId: string): Promise<any> {
  const sql =
    'INSERT INTO comments_rating (id, comment_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 0';
  const values = [uuid.v4(), commentId, accountId, 0];
  return query(sql, values);
}

function unratedComment(commentId: string, accountId: string): Promise<any> {
  const sql =
    'DELETE FROM comments_rating WHERE comment_id = ? AND account_id = ?';
  const values = [commentId, accountId];
  return query(sql, values);
}

function getCommentsActivity(
  accountId: string,
  before: Date | null,
  after: Date | null,
  limit: number
) {
  const activityDate = new Date();
  activityDate.setDate(
    activityDate.getDate() - COMMENTS_CONSTANTS.ACTIVITY_DAYS
  );
  let sql = `SELECT c1.id, c1.creation_date, c1.likes, c1.dislikes, c1.parent_id, c1.content, c1.image_src, c1.image_nsfw, c1.link, c1.account_id,
                 p.content as post_content, p.image_src as post_image_src, p.image_nsfw as post_image_nsfw, p.link as post_link,
                 c2.content as parent_content, c2.image_src as parent_image_src, c2.image_nsfw as parent_image_nsfw, c2.link as parent_link
                 FROM comments c1 LEFT JOIN posts p ON p.id = c1.post_id LEFT JOIN comments c2 ON c1.parent_id = c2.id
                 WHERE c1.account_id = ? AND c1.deletion_date IS NULL AND c2.deletion_date IS NULL AND p.deletion_date IS NULL 
                 AND c1.creation_date > ?`;
  const values: any = [accountId, activityDate];
  if (after) {
    sql += ' AND c1.creation_date < ?';
    values.push(after);
  }
  if (before) {
    sql += ' AND c1.creation_date > ?';
    values.push(before);
  }
  sql += ' ORDER BY c1.creation_date DESC LIMIT ?';
  values.push(limit);
  return query(sql, values);
}

function getCommentByLink(link: string, accountId?: string) {
  const sql = 'SELECT id FROM comments WHERE link = ?';
  const values = [link];
  if (accountId) {
    return query(sql, values).then((rows: any) => {
      return getCommentById(rows[0].id, accountId);
    });
  } else {
    return query(sql, values).then((rows: any) => {
      return getCommentByIdNoAccount(rows[0].id);
    });
  }
}

function linkExists(link: string) {
  const sql = 'SELECT link FROM comments WHERE link = ?';
  const values = [link];

  return query(sql, values).then((link: any) => {
    return link.length > 0;
  });
}

function checkOwned(postId: string, accountId: string) {
  const sql = 'SELECT count(*) FROM comments WHERE id = ? AND account_id = ?';
  const values = [postId, accountId];

  return query(sql, values).then((rows: any) => {
    return rows.length > 0;
  });
}

function updateNsfw(commentId: string, nsfw: boolean) {
  const sql = 'UPDATE comments SET image_nsfw = ? WHERE id = ?';
  const values = [nsfw, commentId];

  return query(sql, values);
}
