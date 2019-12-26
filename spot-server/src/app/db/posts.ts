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

function addPost(spot: string, content: string) {
    var sql = 'INSERT INTO Posts (id, creation_date, creator, spot, longitude, latitude, content, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [uuid.v4(), new Date(), "Kevin", spot, 43.1233, 45.2323, content, 0, 0];
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

function deletePost(id: string) {
    var sql = 'DELETE FROM posts WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}
