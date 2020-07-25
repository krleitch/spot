export { addComment, deleteCommentById, deleteCommentByPostId, getCommentByPostId,
          getNumberOfRepliesForComment, addReply, getRepliesByCommentId, getNumberOfCommentsForPost,
          likeComment, dislikeComment, getCommentsActivity, getCommentById, getCommentByLink,
          getNumberOfCommentsForPostBeforeDate, getCommentByPostIdNoAccount, getCommentByIdNoAccount }

const uuid = require('uuid');
const db = require('./mySql');

// Used for getting a comment or reply
function getCommentById(commentId: string, accountId: string): Promise<any> {
    var sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.likes, comments.dislikes,
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
                        comments.likes, comments.dislikes
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.id = ? AND comments.deletion_date IS NULL GROUP BY comments.id`;
    var values = [commentId];
    return db.query(sql, values);
}

// postId, accountId, date, limit, type
// Used for getting just the comments of a post
function getCommentByPostId(postId: string, date: string, limit: number, type: string, accountId: string): Promise<any> {
    var selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.likes, comments.dislikes`

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
                        comments.likes, comments.dislikes,
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

function addComment(commentId: string, postId: string, accountId: string, content: string, image: string, link: string): Promise<any> {
    // Note the parent_id is NULL
    var sql = 'INSERT INTO comments (id, post_id, account_id, creation_date, content, link, image_src, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [commentId, postId, accountId, new Date(), content, link, image, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(commentId, accountId);  
    });
}

function deleteCommentById(commentId: string, accountId: string): Promise<any> {
    var sql = 'UPDATE comments SET deletion_date = ? WHERE id = ? AND account_id = ?';
    var values = [new Date(), commentId, accountId];
    return db.query(sql, values);
}

function deleteCommentByPostId(postId: string, accountId: string): Promise<any> {
    var sql = 'UPDATE comments SET deletion_date = ? WHERE post_id = ? AND account_id = ?';
    var values = [new Date(), postId, accountId];
    return db.query(sql, values);
}

// Add a reply
function addReply(postId: string, commentId: string, accountId: string, content: string, image: string, link: string): Promise<any> {
    const replyId = uuid.v4();
    var sql = 'INSERT INTO comments (id, post_id, parent_id, account_id, creation_date, content, link, image_src, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [replyId, postId, commentId, accountId, new Date(), content, link, image, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(replyId, accountId);  
    });    
}

// Used for getting just the comments of a post
function getRepliesByCommentId(postId: string, commentId: string, offset: number, limit: number, accountId?: string): Promise<any> {
    var selectSql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content, comments.account_id, comments.image_src,
                        comments.likes, comments.dislikes`

    var accountSql = '';
    var accountValues: any[] = [];
    if ( accountId ) {
        accountSql = `, (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
                        WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
                        ELSE NULL END) AS rated,
                        (CASE WHEN comments.account_id = ? THEN 1 ELSE 0 END) AS owned`;
                        accountValues = [accountId, accountId, accountId];
    }

    var joinSql =     ` FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
                        WHERE comments.post_id = ? AND comments.parent_id = ? AND comments.deletion_date IS NULL
                        GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? OFFSET ?`;
    var sql = selectSql + accountSql + joinSql;
    var values = accountValues.concat([postId, commentId, limit, offset]);
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

function getCommentsActivity(accountId: string, date: string, limit: number) {
    var sql = `SELECT c1.id, c1.creation_date, c1.likes, c1.dislikes, c1.parent_id, c1.content, c1.image_src, c1.link,
                 p.content as post_content, p.image_src as post_image_src, p.link as post_link,
                 c2.content as parent_content, c2.image_src as parent_image_src, c2.link as parent_link
                 FROM comments c1 LEFT JOIN posts p ON p.id = c1.post_id LEFT JOIN comments c2 ON c1.parent_id = c2.id
                 WHERE c1.account_id = ? AND c1.deletion_date IS NULL AND c2.deletion_date IS NULL AND p.deletion_date IS NULL 
                 AND c1.creation_date < ? ORDER BY c1.creation_date DESC LIMIT ?`;
    var values = [accountId, new Date(date), limit];
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
