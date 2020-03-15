export { addPostReport, addCommentReport }

const uuid = require('uuid');

const db = require('./mySql');

function addPostReport(postId: string, accountId: string, content: string) {
    const reportId = uuid.v4();
    var sql = 'INSERT INTO reports (id, reporter_id, post_id, content, creation_date) VALUES (?, ?, ?, ?, ?)';
    var values = [reportId, accountId, postId, content, new Date() ];
    return db.query(sql, values);
}

function addCommentReport(postId: string, commentId: string, accountId: string, content: string) {
    const reportId = uuid.v4();
    var sql = 'INSERT INTO reports (id, reporter_id, post_id, comment_id, content, creation_date) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [reportId, accountId, postId, commentId, content, new Date() ];
    return db.query(sql, values);
}
