export default {
  getFriends,
  getFriendRequests,
  addFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriendById,
  friendRequestExists,
  getFriendsExist,
  getPendingFriendRequests
};

import uuid from 'uuid';
import { query } from '@db/mySql.js';

// use a union because friends are a 1 row mutual relationship
function getFriends(accountId: string, date: string, limit: number) {
  const selectSql = `SELECT id, creation_date, username, confirmed_date FROM
                (SELECT friends.id, friends.creation_date, friends.confirmed_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.friend_id = accounts.id WHERE account_id = ? AND friends.confirmed_date IS NOT NULL
                UNION
                SELECT friends.id, friends.creation_date, friends.confirmed_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.account_id = accounts.id WHERE friend_id = ? AND friends.confirmed_date IS NOT NULL) results
                WHERE confirmed_date < ? ORDER BY confirmed_date DESC`;
  let values = [accountId, accountId, new Date(date)];
  let limitSql = '';
  if (limit) {
    limitSql = ` LIMIT ?`;
    values = [accountId, accountId, new Date(date), limit.toString()];
  }
  const sql = selectSql + limitSql;

  return query(sql, values);
}

function getFriendsExist(firstId: string, secondId: string) {
  const sql = `SELECT * FROM 
                 (SELECT * FROM friends WHERE account_id = ? AND friend_id = ? AND confirmed_date IS NOT NULL
                  UNION
                  SELECT * FROM friends WHERE account_id = ? and friend_id = ? AND confirmed_date IS NOT NULL) results LIMIT 1`;
  const values = [firstId, secondId, secondId, firstId];
  return query(sql, values);
}

// delete friend
function deleteFriendById(id: string, accountId: string) {
  const sql = `DELETE FROM friends WHERE id = ? AND (account_id = ? OR friend_id = ?)`;
  const values = [id, accountId, accountId];
  return query(sql, values);
}

// friend requests, account_id is the one who sent the request
function getFriendRequests(accountId: string) {
  const sql = `SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.account_id = accounts.id WHERE friend_id = ? AND friends.confirmed_date IS NULL`;
  const values = [accountId];
  return query(sql, values);
}

// return sent but not yet accepted
function getPendingFriendRequests(accountId: string) {
  const sql = `SELECT friends.id, friends.creation_date, accounts.username FROM friends
                LEFT JOIN accounts ON friends.friend_id = accounts.id WHERE account_id = ? AND friends.confirmed_date IS NULL`;
  const values = [accountId];
  return query(sql, values);
}

function getFriendsById(id: string) {
  const sql = `SELECT friends.id, friends.creation_date, a1.username as friend_username, a2.username as account_username FROM friends
                LEFT JOIN accounts a1 ON friends.friend_id = a1.id
                LEFT JOIN accounts a2 ON friends.account_id = a2.id WHERE friends.id = ?`;
  const values = [id];
  return query(sql, values);
}

// Check if you have a friend request from account friendId
function friendRequestExists(friendId: string, accountId: string) {
  const sql = `SELECT id, account_id FROM 
                (SELECT * FROM friends WHERE account_id = ? AND friend_id = ? AND confirmed_date IS NULL
                UNION
                SELECT * FROM friends WHERE account_id = ? and friend_id = ? AND confirmed_date IS NULL) results LIMIT 1`;
  const values = [friendId, accountId, accountId, friendId];
  return query(sql, values);
}

function addFriendRequest(senderId: string, receiverId: string) {
  const friendRequestId = uuid.v4();
  const sql = `Insert INTO friends (id, account_id, friend_id, creation_date, confirmed_date) VALUES (?, ?, ?, ?, ?)`;
  const values = [friendRequestId, senderId, receiverId, new Date(), null];
  return query(sql, values).then((rows: any) => {
    return getFriendsById(friendRequestId);
  });
}

// function deleteFriendRequestsByReceiverId(id: string, accountId: string) {
//     var sql = `DELETE FROM friend_requests WHERE id = ? AND receiver_id = ?`;
//     var values = [id, accountId];
//     return query(sql, values);
// }

function acceptFriendRequest(id: string, accountId: string) {
  const sql = `UPDATE friends SET confirmed_date = ? WHERE id = ? AND friend_id = ? AND confirmed_date IS NULL`;
  const values = [new Date(), id, accountId];
  return query(sql, values).then((rows: any) => {
    return getFriendsById(id);
  });
}

function declineFriendRequest(id: string, accountId: string) {
  const sql = `DELETE FROM friends WHERE id = ? AND friend_id = ? AND confirmed_date IS NULL`;
  const values = [id, accountId];
  return query(sql, values);
}
