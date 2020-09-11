export { getPosts, getPostById, addPost, likePost, dislikePost, deletePost, getPostCreator, getPostByLink, getPostsActivity,
            getPostByIdNoAccount, linkExists }

const uuid = require('uuid');

const db = require('./mySql');

function getPosts(accountId: string, sort: string, location: string, latitude: string, longitude: string,  offset: number, limit: number, date: string): Promise<any> {

    // 10 miles if location === local
    const distance = 10;

    var values: any[] = [];
    var selectSql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                        posts.likes, posts.dislikes, posts.comments, posts.geolocation,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                      WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                      ELSE NULL END) AS rated,
                (CASE WHEN posts.account_id = ? THEN 1 ELSE 0 END) AS owned
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.deletion_date IS NULL `;

    values = values.concat([accountId, accountId, accountId]);
    var locationSql;
    if ( location === 'local' ) {
        locationSql =`AND (
                            3959 * acos (
                            cos ( radians( ? ) )
                            * cos( radians( posts.latitude ) )
                            * cos( radians( posts.longitude ) - radians( ? ) )
                            + sin ( radians( ? ) )
                            * sin( radians( posts.latitude ) )
                            )
                          ) < ? `;
        values = values.concat([latitude, longitude, latitude, distance]);
    } else {
        locationSql = '';
    }

    var dateSql = '';
    if ( sort === 'new' ) {
        dateSql = 'AND posts.creation_date < ? '
        values = values.concat([new Date(date)]);
    }

    var groupSql = 'GROUP BY posts.id';

    var sortSql;
    if ( sort === 'new' ) {
        sortSql = ' ORDER BY posts.creation_date DESC';
    } else {
        sortSql = ' ORDER BY IF( likes - dislikes >= 0, IF( likes - dislikes > 0, 1, 0 ), -1 ) * ( LOG( 10, GREATEST( ABS( likes - dislikes ), 1 ) ) + ( ( UNIX_TIMESTAMP(posts.creation_date) - 1134028003 ) / 45000 ) ) DESC';
    }

    var limitOffsetSql = ' LIMIT ? OFFSET ?';
    values = values.concat([limit, offset]);

    var sql = selectSql + locationSql + dateSql + groupSql + sortSql + limitOffsetSql;

    return db.query(sql, values);
}

function getPostById(postId: string, accountId: string): Promise<any> {
    var sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                    posts.likes, posts.dislikes, posts.comments, posts.geolocation,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                    WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                    ELSE NULL END) AS rated,
                (CASE WHEN posts.account_id = ? THEN 1 ELSE 0 END) AS owned
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.id = ? AND posts.deletion_date IS NULL GROUP BY posts.id ORDER BY posts.creation_date DESC`;
    var values = [accountId, accountId, accountId, postId];
    return db.query(sql, values);
}

function getPostByIdNoAccount(postId: string): Promise<any> {
    var sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                    posts.likes, posts.dislikes, posts.comments, posts.geolocation
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.id = ? AND posts.deletion_date IS NULL GROUP BY posts.id ORDER BY posts.creation_date DESC`;
    var values = [postId];
    return db.query(sql, values);
}

function addPost(postId: string, content: string, location: any, imageSrc: string, link: string, accountId: string, geolocation: string): Promise<any> {
    var sql = 'INSERT INTO posts (id, creation_date, account_id, longitude, latitude, content, link, image_src, likes, dislikes, comments, geolocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [postId, new Date(), accountId, location.longitude, location.latitude, content, link, imageSrc, 0, 0, 0, geolocation];
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

function getPostByLink(link: string, accountId?: string) {
    
    var sql = 'SELECT id FROM posts WHERE link = ?';
    var values = [link];

    if ( accountId ) {
        return db.query(sql, values).then( (rows: any) => {
            return getPostById(rows[0].id, accountId);
        });
    } else {
        return db.query(sql, values).then( (rows: any) => {
            return getPostByIdNoAccount(rows[0].id);
        });
    }

}

function getPostsActivity(accountId: string, date: string, limit: number) {
    const days = 365;
    var d = new Date();
    d.setDate(d.getDate() - days);
    var sql = `SELECT id, creation_date, longitude, latitude, geolocation, content, link, image_src, likes, dislikes, comments
                FROM posts WHERE account_id = ? AND deletion_date IS NULL AND creation_date < ? AND creation_date > ? ORDER BY creation_date DESC LIMIT ?`;
    var values = [accountId,  new Date(date), d, limit];
    return db.query(sql, values);
}

// Check existance

function linkExists(link: string) {
    
    var sql = 'SELECT link FROM posts WHERE link = ?';
    var values = [link];

    return db.query(sql, values).then( (link: any) => {
        return link.length > 0;
    });

}
