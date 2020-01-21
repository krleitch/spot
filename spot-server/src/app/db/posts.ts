export { getPosts, getPostById, addPost, likePost, dislikePost, deletePost }

const uuid = require('uuid');

const db = require('./mySql');

function getPosts(accoutId: string): Promise<any> {
    var sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content,
                SUM(CASE WHEN posts_rating.rating = 1 THEN 1 ELSE 0 END) AS likes,
                SUM(CASE WHEN posts_rating.rating = 0 THEN 1 ELSE 0 END) AS dislikes,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                      WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                      ELSE NULL END) AS rated
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id GROUP BY posts.id ORDER BY posts.creation_date DESC`;
    var values = [accoutId, accoutId];
    return db.query(sql, values);
}

function getPostById(id: string): Promise<any> {
    var sql = 'SELECT * FROM posts WHERE id = ?';
    var values = [id];
    return db.query(sql, values);
}

function addPost(content: string, user: string): Promise<any> {
    var sql = 'INSERT INTO posts (id, creation_date, account_id, longitude, latitude, content) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [uuid.v4(), new Date(), user, 43.1233, 45.2323, content];
    return db.query(sql, values);
}

function likePost(postId: string, accountId: string): Promise<any> {
    var sql = 'INSERT INTO posts_rating (id, post_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 1';
    var values = [uuid.v4(), postId, accountId, 1];
    return db.query(sql, values);
}

function dislikePost(postId: string, accountId: string): Promise<any> {
    var sql = 'INSERT INTO posts_rating (id, post_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 0';
    var values = [uuid.v4(), postId, accountId, 0];
    return db.query(sql, values);
}

function deletePost(id: string): Promise<any> {
    var sql = 'DELETE FROM posts_rating WHERE post_id = ?';
    var values = [id];
    return db.query(sql, values).then( (rows: any) => {
        var sql = 'DELETE FROM posts WHERE id = ?';
        var values = [id];
        return db.query(sql, values);
    });
}
