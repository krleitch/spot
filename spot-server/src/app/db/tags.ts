export { addTag, getTagsByCommentId, TaggedInCommentChain }

const uuid = require('uuid');

const db = require('./mySql');

function addTag(accountId: string, commentId: string, offset: number): Promise<any> {
    const tagId = uuid.v4();
    var sql = 'INSERT INTO tags (id, account_id, comment_id, creation_date, offset) VALUES (?, ?, ?, ?, ?)';
    var values = [tagId, accountId, commentId, new Date(), offset ];
    return db.query(sql, values);
}

function getTagsByCommentId(commentId: string): Promise<any> {
    var sql = 'SELECT * FROM tags WHERE comment_id = ? ORDER BY offset ASC';
    var values = [commentId];
    return db.query(sql, values);
}

// the commentId is the parent comment, not a reply
function TaggedInCommentChain(commentId: string): Promise<boolean> {
    var sql = 'SELECT * FROM tags WHERE comment_id = ? ORDER BY offset ASC';
    var values = [commentId];
    return db.query(sql, values).then( (rows: any) => {
        return rows.length > 0;
    });
}
