export { addComment, deleteCommentById, deleteCommentByPostId, getCommentByPostId,
          getNumberOfRepliesForComment, addReply, getRepliesByCommentId, getNumberOfCommentsForPost }

const uuid = require('uuid');

const db = require('./mySql');

// Used for getting a comment or reply
function getCommentById(commentId: string): Promise<any> {
    var sql = 'SELECT * FROM comments WHERE id = ?';
    var values = [commentId];
    return db.query(sql, values);
}

// Used for getting just the comments of a post
function getCommentByPostId(postId: string, offset: number, limit: number): Promise<any> {
    var sql = 'SELECT * FROM comments WHERE post_id = ? AND parent_id IS NULL ORDER BY creation_date DESC LIMIT ? OFFSET ?';
    var values = [postId, limit, offset];
    return db.query(sql, values);
}

function addComment(postId: string, accountId: string, content: string): Promise<any> {
    const commentId = uuid.v4();
    // Note the parent_id is NULL
    var sql = 'INSERT INTO comments (id, post_id, account_id, creation_date, content, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?)';
    var values = [commentId, postId, accountId, new Date(), content, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(commentId);  
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
    var sql = 'INSERT INTO comments (id, post_id, parent_id, account_id, creation_date, content, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [replyId, postId, commentId, accountId, new Date(), content, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(replyId);  
    });    
}

// Used for getting just the comments of a post
function getRepliesByCommentId(postId: string, commentId: string, offset: number, limit: number): Promise<any> {
    var sql = 'SELECT * FROM comments WHERE post_id = ? AND parent_id = ? ORDER BY creation_date DESC LIMIT ? OFFSET ?';
    var values = [postId, commentId, limit, offset];
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
