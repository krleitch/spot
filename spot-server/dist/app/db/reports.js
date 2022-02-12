export default{addPostReport,addCommentReport};import uuid from"uuid";import{query}from"@db/mySql";function addPostReport(postId,accountId,content,category){const reportId=uuid.v4();const sql="INSERT INTO reports (id, reporter_id, post_id, content, category, creation_date) VALUES (?, ?, ?, ?, ?, ?)";const values=[reportId,accountId,postId,content,category,new Date];return query(sql,values)}function addCommentReport(postId,commentId,accountId,content,category){const reportId=uuid.v4();const sql="INSERT INTO reports (id, reporter_id, post_id, comment_id, content, category, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?)";const values=[reportId,accountId,postId,commentId,content,category,new Date];return query(sql,values)}
//# sourceMappingURL=reports.js.map