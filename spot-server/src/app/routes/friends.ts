import express from 'express';
const router = express.Router();

// db
import friends from '@db/friends.js';
import accounts from '@db/accounts.js';

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// errors
import * as FriendsError from '@exceptions/friends.js';
import ErrorHandler from '@helpers/errorHandler.js';
import { ERROR_MESSAGES } from '@exceptions/messages.js';
const FRIENDS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.FRIENDS;

// services
import authorization from '@services/authorization/authorization.js';

// constants
import roles from '@services/authorization/roles.js';

router.use(function timeLog(req: any, res: any, next: any) {
  next();
});

// Get friends
router.get(
  '/',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const date = req.query.date;
    const limit = Number(req.query.limit);

    friends.getFriends(accountId, date, limit).then(
      (rows: any) => {
        const response = { friends: rows };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new FriendsError.GetFriends(500));
      }
    );
  }
);

// delete a friend
router.delete(
  '/:friendId',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const friendId = req.params.friendId;

    friends.deleteFriendById(friendId, accountId).then(
      (rows: any) => {
        const response = { friendId: friendId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new FriendsError.DeleteFriend(500));
      }
    );
  }
);

// get pending friend requests
router.get(
  '/pending',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;

    friends.getPendingFriendRequests(accountId).then(
      (rows: any) => {
        const response = { friendRequests: rows };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new FriendsError.GetPendingFriendRequests(500));
      }
    );
  }
);

// delete a pending friend
router.delete(
  '/pending/:friendId',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const friendId = req.params.friendId;

    friends.deleteFriendById(friendId, accountId).then(
      (rows: any) => {
        const response = { friendRequestId: friendId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new FriendsError.DeletePendingFriendRequest(500));
      }
    );
  }
);

// get friend requests for the user
router.get(
  '/requests',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;

    friends.getFriendRequests(accountId).then(
      (rows: any) => {
        const response = { friendRequests: rows };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new FriendsError.GetFriendRequests(500));
      }
    );
  }
);

// send a friend request
router.post(
  '/requests',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { username } = req.body;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new FriendsError.FriendExistsError(500));
    }

    accounts.getAccountByUsername(username).then(
        async (receiverId: any) => {
          // No account with this username
          if (receiverId[0] === undefined) {
            return next(
              new FriendsError.UsernameError(
                FRIENDS_ERROR_MESSAGES.NO_USER,
                400
              )
            );
          }

          // Cannot add yourself
          if (receiverId[0].id === accountId) {
            return next(
              new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.SELF, 400)
            );
          }

          const exists = await friends.getFriendsExist(
            accountId,
            receiverId[0].id
          );
          if (exists.length > 0) {
            return next(new FriendsError.FriendExistsError(500));
          }

          friends.friendRequestExists(receiverId[0].id, accountId).then(
            (friendRequest: any) => {
              // If a request already exists, then just accept it
              if (friendRequest.length > 0) {
                // you already sent a request
                if (friendRequest[0].account_id === accountId) {
                  return next(
                    new FriendsError.UsernameError(
                      FRIENDS_ERROR_MESSAGES.REQUEST_EXISTS,
                      400
                    )
                  );
                }

                // accept the request
                friends
                  .acceptFriendRequest(friendRequest[0].id, accountId)
                  .then(
                    (rows: any) => {
                      accounts.getAccountById(rows[0].account_id).then(
                        (account: any) => {
                          rows[0].username = account[0].username;
                          const response = { friend: rows[0] };
                          res.status(200).json(response);
                        },
                        (err: any) => {
                          return next(new FriendsError.FriendExistsError(500));
                        }
                      );
                    },
                    (err: any) => {
                      return next(new FriendsError.FriendExistsError(500));
                    }
                  );
              } else {
                friends.addFriendRequest(accountId, receiverId[0].id).then(
                  (rows: any) => {
                    rows[0].username = rows[0].friend_username;
                    delete rows[0].friend_username;
                    delete rows[0].account_username;
                    const response = { friend: rows[0] };
                    res.status(200).json(response);
                  },
                  (err: any) => {
                    return next(
                      new FriendsError.UsernameError(
                        FRIENDS_ERROR_MESSAGES.GENERIC,
                        500
                      )
                    );
                  }
                );
              }
            },
            (err: any) => {
              return next(new FriendsError.FriendExistsError(500));
            }
          );
        },
        (err: any) => {
          return next(
            new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.GENERIC, 500)
          );
        }
    );
  })
);

// accept a friend request
router.post(
  '/requests/accept',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { friendRequestId } = req.body;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new FriendsError.AcceptFriendRequest(500));
    }

    friends.acceptFriendRequest(friendRequestId, accountId).then(
      (rows: any) => {
        if (rows.length < 1) {
          return next(new FriendsError.AcceptFriendRequest(500));
        } else {
          rows[0].username = rows[0].account_username;
          delete rows[0].friend_username;
          delete rows[0].account_username;
          const response = { friend: rows[0] };
          res.status(200).json(response);
        }
      },
      (err: any) => {
        return next(new FriendsError.AcceptFriendRequest(500));
      }
    );
  }
);

// decline a friend request
router.post(
  '/requests/decline',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { friendRequestId } = req.body;

    friends.declineFriendRequest(friendRequestId, accountId).then(
      (rows: any) => {
        const response = {};
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new FriendsError.DeclineFriendRequest(500));
      }
    );
  }
);

// delete a friend request
// router.delete('/requests/:friendRequestId', function (req: any, res: any) {

//     const accountId = req.user.id;
//     const friendRequestId = req.params.friendRequestId;

//     friends.deleteFriendRequestsById(friendRequestId, accountId).then((rows: any) => {
//         res.status(200).json({ friendRequest: rows[0] });
//     }, (err: any) => {
//         res.status(500).send('Error deleting friend request');
//     });
// });

export default router;
