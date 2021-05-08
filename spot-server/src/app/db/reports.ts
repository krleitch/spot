export { addPostReport, addCommentReport }

const uuid = require('uuid');

const db = require('./mySql');

function addPostReport(postId: string, accountId: string, content: string, category: number): Promise<any> {
    const reportId = uuid.v4();
    var sql = 'INSERT INTO reports (id, reporter_id, post_id, content, category, creation_date) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [reportId, accountId, postId, content, category, new Date() ];
    return db.query(sql, values);
}

function addCommentReport(postId: string, commentId: string, accountId: string, content: string, category: number): Promise<any> {
    const reportId = uuid.v4();
    var sql = 'INSERT INTO reports (id, reporter_id, post_id, comment_id, content, category, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    var values = [reportId, accountId, postId, commentId, content, category, new Date() ];
    return db.query(sql, values);
}
