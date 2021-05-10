export { addComment, deleteCommentById, deleteReplyByParentId, getCommentByPostId, getNumberOfRepliesForCommentAfterDate,
          getNumberOfRepliesForComment, addReply, getRepliesByCommentId, getNumberOfCommentsForPost, getRepliesUpToDate,
          likeComment, dislikeComment, getCommentsActivity, getCommentById, getCommentByLink, getNumberOfCommentsForPostAfterDate,
          getNumberOfCommentsForPostBeforeDate, getCommentByPostIdNoAccount, getCommentByIdNoAccount, linkExists, unratedComment }

const uuid = require('uuid');

// db
const db = require('./mySql');

// constants
const commentsConstants = require('@constants/comments');
const COMMENTS_CONSTANTS = commentsConstants.COMMENTS_CONSTANTS;

// Used for getting a comment or reply
function getCommentById(commentId: string, accountId: string): Promise<any> {
    var sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.comment_parent_id, comments.link,
        (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
            WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
            ELSE NULL END) AS rated,
        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.id = ? AND comments.deletion_date IS NULL GROUP BY comments.id`;
    var values = [accountId, accountId, accountId, commentId];
    return db.query(sql, values);
}

function getCommentByIdNoAccount(commentId: string): Promise<any> {
    var sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.id = ? AND comments.deletion_date IS NULL GROUP BY comments.id`;
    var values = [commentId];
    return db.query(sql, values);
}

// postId, accountId, date, limit, type
// Used for getting just the comments of a post
function getCommentByPostId(postId: string, date: string, limit: number, type: string, accountId: string): Promise<any> {
    var selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link`

    var accountSql = '';
    var accountValues: any[] = [];
    if ( accountId ) {
        accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`
        accountValues = [accountId, accountId, accountId];
    }

    var joinSql =  ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id
                        WHERE comments.post_id = ? AND comments.parent_id IS NULL AND comments.deletion_date IS NULL `;

    var orderSql;
    if ( type == 'after' ) {
        orderSql = ` AND comments.creation_date > ? GROUP BY comments.id ORDER BY comments.creation_date ASC LIMIT ? `
    } else {
        orderSql = `  AND comments.creation_date < ? GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? `
    }

    var sql = selectSql + accountSql + joinSql + orderSql;
    var values = accountValues.concat([postId, new Date(date), limit]);
    return db.query(sql, values);
}

function getCommentByPostIdNoAccount(postId: string, date: string, limit: number, type: string): Promise<any> {
    var selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id
        WHERE comments.post_id = ? AND comments.parent_id IS NULL AND comments.deletion_date IS NULL `;

    var orderSql;
    if ( type == 'after' ) {
        orderSql = ` AND comments.creation_date > ? GROUP BY comments.id ORDER BY comments.creation_date ASC LIMIT ? `
    } else {
        orderSql = `  AND comments.creation_date < ? GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? `
    }

    var sql = selectSql + orderSql;
    var values = [postId, new Date(date), limit];
    return db.query(sql, values);
}

function addComment(commentId: string, postId: string, accountId: string, content: string, image: string, imageNsfw: boolean, link: string, commentParentId: string): Promise<any> {
    // Note the parent_id is NULL
    var sql = 'INSERT INTO comments (id, post_id, account_id, creation_date, comment_parent_id, content, link, image_src, image_nsfw, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [commentId, postId, accountId, new Date(), commentParentId, content, link, image, imageNsfw, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(commentId, accountId);  
    });
}

function deleteCommentById(commentId: string, accountId: string): Promise<any> {
    var sql = 'UPDATE comments SET deletion_date = ? WHERE id = ? AND account_id = ?';
    var values = [new Date(), commentId, accountId];
    return db.query(sql, values);
}

function deleteReplyByParentId(parentId: string): Promise<any> {
    var sql = 'UPDATE comments SET deletion_date = ? WHERE parent_id = ?';
    var values = [new Date(), parentId];
    return db.query(sql, values);
}

// Add a reply
function addReply(replyId: string, postId: string, commentId: string, commentParentId: string, accountId: string, content: string, image: string, imageNsfw: boolean, link: string): Promise<any> {
    var sql = 'INSERT INTO comments (id, post_id, parent_id, comment_parent_id, account_id, creation_date, content, link, image_src, image_nsfw, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [replyId, postId, commentId, commentParentId, accountId, new Date(), content, link, image, imageNsfw, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(replyId, accountId);  
    });    
}

// Used for getting just the comments of a post
function getRepliesByCommentId(postId: string, commentId: string, date: string, limit: number, accountId?: string): Promise<any> {
    var selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link`

    var accountSql = '';
    var values: any[] = [];
    if ( accountId ) {
        accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`;
                        values = values.concat([accountId, accountId, accountId]);
    }

    var joinSql = ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
                    WHERE comments.post_id = ? AND comments.parent_id = ? AND comments.deletion_date IS NULL `
    values = values.concat([postId, commentId])

    var dateSql = ``;
    if ( date ) {
        var dateSql = `AND comments.creation_date > ? `
        values = values.concat([new Date(date)])
    }

    var orderSql = `GROUP BY comments.id ORDER BY comments.creation_date ASC LIMIT ?`;
    var sql = selectSql + accountSql + joinSql + dateSql + orderSql;
    var values = values.concat([limit]);
    return db.query(sql, values);
}

// Used for getting just the comments of a post
function getRepliesUpToDate(postId: string, commentId: string, date: string, accountId?: string): Promise<any> {
    var selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.image_nsfw, comments.likes, comments.dislikes, comments.link`

    var accountSql = '';
    var values: any[] = [];
    if ( accountId ) {
        accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`;
                        values = values.concat([accountId, accountId, accountId]);
    }

    var joinSql = ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
                    WHERE comments.post_id = ? AND comments.parent_id = ? AND comments.deletion_date IS NULL `
    values = values.concat([postId, commentId])

    var dateSql = `AND comments.creation_date <= ? `
    values = values.concat([new Date(date)])

    var orderSql = `GROUP BY comments.id ORDER BY comments.creation_date ASC`;
    var sql = selectSql + accountSql + joinSql + dateSql + orderSql;
    return db.query(sql, values);
}

// Return the number of comments
function getNumberOfCommentsForPost(postId: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND deletion_date IS NULL AND parent_id IS NULL';
    var values = [postId];
    return db.query(sql, values);
}

// Return the number of comments before a date
function getNumberOfCommentsForPostBeforeDate(postId: string, date: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND deletion_date IS NULL AND parent_id IS NULL AND creation_date < ?';
    var values = [postId, new Date(date)];
    return db.query(sql, values);
}

function getNumberOfCommentsForPostAfterDate(postId: string, date: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND deletion_date IS NULL AND parent_id IS NULL AND creation_date > ?';
    var values = [postId, new Date(date)];
    return db.query(sql, values);
}

function getNumberOfRepliesForCommentAfterDate(postId: string, commentId: string, date: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ? and parent_id = ? AND deletion_date IS NULL AND creation_date > ?';
    var values = [postId, commentId, new Date(date)];
    return db.query(sql, values);
}

// Return the number of replies for comment for post
function getNumberOfRepliesForComment(postId: string, commentId: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND parent_id = ? AND deletion_date IS NULL';
    var values = [postId, commentId];
    return db.query(sql, values);
}

function likeComment(commentId: string, accountId: string): Promise<any> {
    var sql = 'INSERT INTO comments_rating (id, comment_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 1';
    var values = [uuid.v4(), commentId, accountId, 1];
    return db.query(sql, values);
}

function dislikeComment(commentId: string, accountId: string): Promise<any> {
    var sql = 'INSERT INTO comments_rating (id, comment_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 0';
    var values = [uuid.v4(), commentId, accountId, 0];
    return db.query(sql, values);
}

function unratedComment(commentId: string, accountId: string): Promise<any> {
    var sql = 'DELETE FROM comments_rating WHERE comment_id = ? AND account_id = ?';
    var values = [commentId, accountId];
    return db.query(sql, values);
}

function getCommentsActivity(accountId: string, before: Date, after: Date, limit: number) {
    var activityDate = new Date();
    activityDate.setDate(activityDate.getDate() - COMMENTS_CONSTANTS.ACTIVITY_DAYS);
    var sql = `SELECT c1.id, c1.creation_date, c1.likes, c1.dislikes, c1.parent_id, c1.content, c1.image_src, c1.image_nsfw, c1.link, c1.account_id,
                 p.content as post_content, p.image_src as post_image_src, p.image_nsfw as post_image_nsfw, p.link as post_link,
                 c2.content as parent_content, c2.image_src as parent_image_src, c2.image_nsfw as parent_image_nsfw, c2.link as parent_link
                 FROM comments c1 LEFT JOIN posts p ON p.id = c1.post_id LEFT JOIN comments c2 ON c1.parent_id = c2.id
                 WHERE c1.account_id = ? AND c1.deletion_date IS NULL AND c2.deletion_date IS NULL AND p.deletion_date IS NULL 
                 AND c1.creation_date > ?`;
    var values: any = [accountId, activityDate];
    if ( after ) {
        sql += ' AND c1.creation_date < ?';
        values.push(after)
    }
    if ( before ) {
        sql += ' AND c1.creation_date > ?';
        values.push(before)
    }
    sql += ' ORDER BY c1.creation_date DESC LIMIT ?'
    values.push(limit)
    return db.query(sql, values);
}

function getCommentByLink(link: string, accountId?: string) {
    var sql = 'SELECT id FROM comments WHERE link = ?';
    var values = [link];
    if ( accountId ) {
        return db.query(sql, values).then( (rows: any) => {
            return getCommentById(rows[0].id, accountId);
        });
    } else {
        return db.query(sql, values).then( (rows: any) => {
            return getCommentByIdNoAccount(rows[0].id);
        });
    }

}

function linkExists(link: string) {
    
    var sql = 'SELECT link FROM comments WHERE link = ?';
    var values = [link];

    return db.query(sql, values).then( (link: any) => {
        return link.length > 0;
    });

}
