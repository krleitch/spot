export default { addPostReport, addCommentReport };

import uuid from 'uuid';
import { query } from '@db/mySql';

function addPostReport(
  postId: string,
  accountId: string,
  content: string,
  category: number
): Promise<any> {
  const reportId = uuid.v4();
  const sql =
    'INSERT INTO reports (id, reporter_id, post_id, content, category, creation_date) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [reportId, accountId, postId, content, category, new Date()];
  return query(sql, values);
}

function addCommentReport(
  postId: string,
  commentId: string,
  accountId: string,
  content: string,
  category: number
): Promise<any> {
  const reportId = uuid.v4();
  const sql =
    'INSERT INTO reports (id, reporter_id, post_id, comment_id, content, category, creation_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [
    reportId,
    accountId,
    postId,
    commentId,
    content,
    category,
    new Date()
  ];
  return query(sql, values);
}
