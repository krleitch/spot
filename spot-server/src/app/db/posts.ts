export { getPosts, getPostById, addPost, likePost, dislikePost, deletePost }

const uuid = require('uuid');

const db = require('./mySql');

function getPosts() {
    var sql = 'SELECT * FROM posts ORDER BY creation_date DESC';
    return db.query(sql);
}

function getPostById(id: string): Promise<any> {
    var sql = 'SELECT * FROM posts WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}

function addPost(content: string, user: string) {
    var sql = 'INSERT INTO Posts (id, creation_date, account_id, longitude, latitude, content, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [uuid.v4(), new Date(), user, 43.1233, 45.2323, content, 0, 0];
    return db.query(sql, values);
}

function likePost(id: string) {
    var sql = 'UPDATE posts SET likes = likes + 1 WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}

function dislikePost(id: string) {
    var sql = 'UPDATE posts SET dislikes = dislikes + 1 WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}

function getLikesForUserForPost(post: string, account: string) {
    var sql = `SELECT
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS likes, 
        SUM(CASE WHEN rating = 0 THEN 1 ELSE 0 END) AS dislikes
        FROM posts_rating WHERE post_id = ? AND account_id = ?`;
    var values = [post, account];
    return db.query(sql, values);
}

function deletePost(id: string) {
    var sql = 'DELETE FROM posts WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}
