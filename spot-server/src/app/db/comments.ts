export { addComment, deleteComment, deleteCommentByPostId, getCommentByPostId }

const uuid = require('uuid');

const db = require('./mySql');

function addComment(postId: string, accountId: string, content: string): Promise<any> {
    const commentId = uuid.v4();
    var sql = 'INSERT INTO comments (id, post_id, account_id, creation_date, content, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?)';
    var values = [commentId, postId, accountId, new Date(), content, 0, 0];
    return db.query(sql, values).then( (rows: any) => {
        return getCommentById(commentId);  
    });
}

function deleteComment(id: string): Promise<any> {
    var sql = 'DELETE FROM comments WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}

function deleteCommentByPostId(postId: string): Promise<any> {
    var sql = 'DELETE FROM comments WHERE post_id = ?';
    var values = [postId];
    return db.query(sql, values);
}

function getCommentById(commentId: string): Promise<any> {
    var sql = 'SELECT * FROM comments WHERE id = ?';
    var values = [commentId];
    return db.query(sql, values);
}

function getCommentByPostId(postId: string): Promise<any> {
    var sql = 'SELECT * FROM comments WHERE post_id = ? ORDER BY creation_date DESC';
    var values = [postId];
    return db.query(sql, values);
}

