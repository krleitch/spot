export { addComment, deleteCommentById, deleteCommentByPostId, getCommentByPostId,
          getNumberOfRepliesForComment, addReply, getRepliesByCommentId, getNumberOfCommentsForPost,
          likeComment, dislikeComment }

const uuid = require('uuid');

const db = require('./mySql');

// Used for getting a comment or reply
function getCommentById(commentId: string, accountId: string): Promise<any> {
    var sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content,
        SUM(CASE WHEN comments_rating.rating = 1 THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN comments_rating.rating = 0 THEN 1 ELSE 0 END) AS dislikes,
        (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
            WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
            ELSE NULL END) AS rated 
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.id = ? GROUP BY comments.id`;
    var values = [accountId, accountId, commentId];
    return db.query(sql, values);
}

// Used for getting just the comments of a post
function getCommentByPostId(postId: string, accountId: string, offset: number, limit: number): Promise<any> {
    var sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content,
        SUM(CASE WHEN comments_rating.rating = 1 THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN comments_rating.rating = 0 THEN 1 ELSE 0 END) AS dislikes,
        (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
            WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
            ELSE NULL END) AS rated 
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.post_id = ? AND comments.parent_id IS NULL GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? OFFSET ?`;
    var values = [accountId, accountId, postId, limit, offset];
    return db.query(sql, values);
}

function addComment(postId: string, accountId: string, content: string): Promise<any> {
    const commentId = uuid.v4();
    // Note the parent_id is NULL
    var sql = 'INSERT INTO comments (id, post_id, account_id, creation_date, content) VALUES (?, ?, ?, ?, ?)';
    var values = [commentId, postId, accountId, new Date(), content];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(commentId, accountId);  
    });
}

function deleteCommentById(commentId: string): Promise<any> {
    var sql = 'DELETE FROM comments WHERE id = ?';
    var values = [commentId];
    return db.query(sql, values);
}

function deleteCommentByPostId(postId: string): Promise<any> {
    var sql = 'DELETE FROM comments WHERE post_id = ?';
    var values = [postId];
    return db.query(sql, values);
}

// Add a reply
function addReply(postId: string, commentId: string, accountId: string, content: string): Promise<any> {
    const replyId = uuid.v4();
    var sql = 'INSERT INTO comments (id, post_id, parent_id, account_id, creation_date, content) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [replyId, postId, commentId, accountId, new Date(), content];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(replyId, accountId);  
    });    
}

// Used for getting just the comments of a post
function getRepliesByCommentId(postId: string, commentId: string, accountId: string, offset: number, limit: number): Promise<any> {
    var sql = `SELECT comments.id, comments.post_id, comments.parent_id, comments.creation_date, comments.content,
        SUM(CASE WHEN comments_rating.rating = 1 THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN comments_rating.rating = 0 THEN 1 ELSE 0 END) AS dislikes,
        (CASE WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 1 THEN 1 
            WHEN ( SELECT rating FROM comments_rating WHERE comment_id = comments.id AND account_id = ? ) = 0 THEN 0
            ELSE NULL END) AS rated 
        FROM comments LEFT JOIN comments_rating ON comments.id = comments_rating.comment_id 
        WHERE comments.post_id = ? AND comments.parent_id = ? GROUP BY comments.id ORDER BY comments.creation_date DESC LIMIT ? OFFSET ?`;
    var values = [accountId, accountId, postId, commentId, limit, offset];
    return db.query(sql, values);
}

// Return the number of comments
function getNumberOfCommentsForPost(postId: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments where post_id = ? AND parent_id IS NULL';
    var values = [postId];
    return db.query(sql, values);
}

// Return the number of replies for comment for post
function getNumberOfRepliesForComment(postId: string, commentId: string): Promise<any> {
    var sql = 'SELECT COUNT(*) as total FROM comments where post_id = ? AND parent_id = ?';
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
