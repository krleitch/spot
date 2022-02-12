export default { addTag, getTagsByCommentId, TaggedInCommentChain };

import uuid from 'uuid';
import { query } from '@db/mySql.js';

function addTag(
  accountId: string,
  commentId: string,
  offset: number
): Promise<any> {
  const tagId = uuid.v4();
  const sql =
    'INSERT INTO tags (id, account_id, comment_id, creation_date, offset) VALUES (?, ?, ?, ?, ?)';
  const values = [tagId, accountId, commentId, new Date(), offset];
  return query(sql, values);
}

function getTagsByCommentId(commentId: string): Promise<any> {
  const sql = 'SELECT * FROM tags WHERE comment_id = ? ORDER BY offset ASC';
  const values = [commentId];
  return query(sql, values);
}

// the commentId is the parent comment, not a reply
function TaggedInCommentChain(
  commentId: string,
  accountId: string
): Promise<boolean> {
  const sql = `SELECT * FROM (SELECT id FROM comments WHERE comment_parent_id = ?) results 
                LEFT JOIN tags t ON t.comment_id = results.id 
                WHERE t.account_id = ?`;
  const values = [commentId, commentId, accountId];
  return query(sql, values).then((rows: any) => {
    return rows.length > 0;
  });
}
