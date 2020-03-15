export { getPosts, getPostById, addPost, likePost, dislikePost, deletePost, getPostCreator, getPostByLink }

const uuid = require('uuid');

const db = require('./mySql');

function getPosts(accountId: string, sort: string, offset: number, limit: number): Promise<any> {
    var sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                SUM(CASE WHEN posts_rating.rating = 1 THEN 1 ELSE 0 END) AS likes,
                SUM(CASE WHEN posts_rating.rating = 0 THEN 1 ELSE 0 END) AS dislikes,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                      WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                      ELSE NULL END) AS rated,
                (CASE WHEN posts.account_id = ? THEN 1 ELSE 0 END) AS owned,
                (SELECT COUNT(*) FROM comments where post_id = posts.id AND deletion_date IS NULL) as comments
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.deletion_date IS NULL GROUP BY posts.id`;
    var sortSql;
    if ( sort === 'new' ) {
        sortSql = ' ORDER BY posts.creation_date DESC';
    } else {
        sortSql = ' ORDER BY likes DESC';
    }
    var limitOffsetSql = ' LIMIT ? OFFSET ?';
    sql = sql + sortSql + limitOffsetSql;
    var values = [accountId, accountId, accountId, limit, offset];
    return db.query(sql, values);
}

function getPostById(postId: string, accountId: string): Promise<any> {
    var sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                SUM(CASE WHEN posts_rating.rating = 1 THEN 1 ELSE 0 END) AS likes,
                SUM(CASE WHEN posts_rating.rating = 0 THEN 1 ELSE 0 END) AS dislikes,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                    WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                    ELSE NULL END) AS rated,
                (CASE WHEN posts.account_id = ? THEN 1 ELSE 0 END) AS owned,
                (SELECT COUNT(*) FROM comments where post_id = posts.id AND deletion_date IS NULL) as comments
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.id = ? AND posts.deletion_date IS NULL GROUP BY posts.id ORDER BY posts.creation_date DESC`;
    var values = [accountId, accountId, accountId, postId];
    return db.query(sql, values);
}

function addPost(content: string, location: any, imageSrc: string, link: string, accountId: string): Promise<any> {
    var postId = uuid.v4();
    var sql = 'INSERT INTO posts (id, creation_date, account_id, longitude, latitude, content, link, image_src) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [postId, new Date(), accountId, location.longitude, location.latitude, content, link, imageSrc];
    return db.query(sql, values).then( (rows: any) => {
        return getPostById(postId, accountId);
    });
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

function deletePost(id: string, accountId: string): Promise<any> {
    var sql = 'UPDATE posts SET deletion_date = ? WHERE id = ? AND account_id = ?';
    var values = [new Date(), id, accountId];
    return db.query(sql, values);
}

function getPostCreator(postId: string) {
    var sql = 'SELECT account_id from posts WHERE id = ?';
    var values = [postId];
    return db.query(sql, values);
}

function getPostByLink(link: string, accountId: string) {
    var sql = 'SELECT id FROM posts WHERE link = ?';
    var values = [link];
    return db.query(sql, values).then( (rows: any) => {
        return getPostById(rows[0].id, accountId);
    });
}
