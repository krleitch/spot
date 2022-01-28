export {
  getPosts,
  getPostById,
  addPost,
  likePost,
  dislikePost,
  deletePost,
  getPostCreator,
  getPostByLink,
  getPostsActivity,
  getPostByIdNoAccount,
  linkExists,
  unratedPost,
  checkOwned,
  updateNsfw
};

const uuid = require('uuid');

// db
const db = require('./mySql');

// constants
const postConstants = require('@constants/posts');
const POST_CONSTANTS = postConstants.POSTS_CONSTANTS;

function getPosts(
  accountId: string,
  sort: string,
  location: string,
  latitude: string,
  longitude: string,
  offset: number,
  limit: number,
  date: string
): Promise<any> {
  // TODO: life is filled with regrets, this is one of them

  // 10 miles if location === local
  const distance = 10;

  let values: any[] = [];
  const selectSql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                        posts.image_nsfw, posts.likes, posts.dislikes, posts.comments, posts.geolocation,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                      WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                      ELSE NULL END) AS rated,
                (CASE WHEN posts.account_id = ? THEN 1 ELSE 0 END) AS owned
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.deletion_date IS NULL `;

  values = values.concat([accountId, accountId, accountId]);
  let locationSql;
  if (location === 'local') {
    locationSql = `AND (
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

  let dateSql = '';
  if (sort === 'new') {
    dateSql = 'AND posts.creation_date < ? ';
    values = values.concat([new Date(date)]);
  }

  const groupSql = 'GROUP BY posts.id';

  let sortSql;
  if (sort === 'new') {
    sortSql = ' ORDER BY posts.creation_date DESC';
  } else {
    sortSql =
      ' ORDER BY IF( likes - dislikes >= 0, IF( likes - dislikes > 0, 1, 0 ), -1 ) * ( LOG( 10, GREATEST( ABS( likes - dislikes ), 1 ) ) + ( ( UNIX_TIMESTAMP(posts.creation_date) - 1134028003 ) / 45000 ) ) DESC';
  }

  let limitOffsetSql;
  if (offset) {
    limitOffsetSql = ' LIMIT ? OFFSET ?';
    values = values.concat([limit, offset]);
  } else {
    limitOffsetSql = ' LIMIT ?';
    values = values.concat([limit]);
  }

  const sql =
    selectSql + locationSql + dateSql + groupSql + sortSql + limitOffsetSql;

  return db.query(sql, values);
}

function getPostById(postId: string, accountId: string): Promise<any> {
  const sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                    posts.image_nsfw, posts.likes, posts.dislikes, posts.comments, posts.geolocation,
                (CASE WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 1 THEN 1 
                    WHEN ( SELECT rating FROM posts_rating WHERE post_id = posts.id AND account_id = ? ) = 0 THEN 0
                    ELSE NULL END) AS rated,
                (CASE WHEN posts.account_id = ? THEN 1 ELSE 0 END) AS owned
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.id = ? AND posts.deletion_date IS NULL GROUP BY posts.id ORDER BY posts.creation_date DESC`;
  const values = [accountId, accountId, accountId, postId];
  return db.query(sql, values);
}

function getPostByIdNoAccount(postId: string): Promise<any> {
  const sql = `SELECT posts.id, posts.creation_date, posts.longitude, posts.latitude, posts.content, posts.link, posts.image_src,
                    posts.image_nsfw, posts.likes, posts.dislikes, posts.comments, posts.geolocation
                FROM posts LEFT JOIN posts_rating ON posts.id = posts_rating.post_id WHERE posts.id = ? AND posts.deletion_date IS NULL GROUP BY posts.id ORDER BY posts.creation_date DESC`;
  const values = [postId];
  return db.query(sql, values);
}

function addPost(
  postId: string,
  content: string,
  location: any,
  imageSrc: string,
  imageNsfw: boolean,
  link: string,
  accountId: string,
  geolocation: string
): Promise<any> {
  const sql = `INSERT INTO posts (id, creation_date, account_id, longitude, latitude, content, link, image_src, 
                image_nsfw, likes, dislikes, comments, geolocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    postId,
    new Date(),
    accountId,
    location.longitude,
    location.latitude,
    content,
    link,
    imageSrc,
    imageNsfw,
    0,
    0,
    0,
    geolocation
  ];
  return db.query(sql, values).then((rows: any) => {
    return getPostById(postId, accountId);
  });
}

function likePost(postId: string, accountId: string): Promise<any> {
  const sql =
    'INSERT INTO posts_rating (id, post_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 1';
  const values = [uuid.v4(), postId, accountId, 1];
  return db.query(sql, values);
}

function dislikePost(postId: string, accountId: string): Promise<any> {
  const sql =
    'INSERT INTO posts_rating (id, post_id, account_id, rating) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = 0';
  const values = [uuid.v4(), postId, accountId, 0];
  return db.query(sql, values);
}

function unratedPost(postId: string, accountId: string): Promise<any> {
  const sql = 'DELETE FROM posts_rating WHERE post_id = ? AND account_id = ?';
  const values = [postId, accountId];
  return db.query(sql, values);
}

function deletePost(id: string): Promise<any> {
  const sql = 'UPDATE posts SET deletion_date = ? WHERE id = ?';
  const values = [new Date(), id];
  return db.query(sql, values);
}

function getPostCreator(postId: string) {
  const sql = 'SELECT account_id from posts WHERE id = ?';
  const values = [postId];
  return db.query(sql, values);
}

function getPostByLink(link: string, accountId?: string) {
  const sql = 'SELECT id FROM posts WHERE link = ?';
  const values = [link];

  if (accountId) {
    return db.query(sql, values).then((rows: any) => {
      return getPostById(rows[0].id, accountId);
    });
  } else {
    return db.query(sql, values).then((rows: any) => {
      return getPostByIdNoAccount(rows[0].id);
    });
  }
}

// Activity
function getPostsActivity(
  accountId: string,
  before: Date,
  after: Date,
  limit: number
) {
  const activityDate = new Date();
  activityDate.setDate(activityDate.getDate() - POST_CONSTANTS.ACTIVITY_DAYS);
  let sql = `SELECT id, creation_date, longitude, latitude, geolocation, content,
                link, image_src, image_nsfw, likes, dislikes, comments FROM posts
                WHERE account_id = ? AND creation_date > ? AND deletion_date IS NULL`;
  const values: any[] = [accountId, activityDate];
  if (after) {
    sql += ' AND creation_date < ?';
    values.push(after);
  }
  if (before) {
    sql += ' AND creation_date > ?';
    values.push(before);
  }
  sql += ` ORDER BY creation_date DESC LIMIT ?`;
  values.push(limit);
  return db.query(sql, values);
}

// Check existance
function linkExists(link: string) {
  const sql = 'SELECT link FROM posts WHERE link = ?';
  const values = [link];

  return db.query(sql, values).then((link: any) => {
    return link.length > 0;
  });
}

function checkOwned(postId: string, accountId: string) {
  const sql = 'SELECT count(*) FROM posts WHERE id = ? AND account_id = ?';
  const values = [postId, accountId];

  return db.query(sql, values).then((rows: any) => {
    return rows.length > 0;
  });
}

function updateNsfw(postId: string, nsfw: boolean) {
  const sql = 'UPDATE posts SET image_nsfw = ? WHERE id = ?';
  const values = [nsfw, postId];

  return db.query(sql, values);
}
