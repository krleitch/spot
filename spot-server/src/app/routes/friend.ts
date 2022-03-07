import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// db
import friends from '@db/friends.js';
import accounts from '@db/accounts.js';
import prismaUser from '@db/../prisma/user.js';
import prismaFriend from '@db/../prisma/friend.js';

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// errors
import * as friendsError from '@exceptions/friends.js';
import ErrorHandler from '@helpers/errorHandler.js';
import { ERROR_MESSAGES } from '@exceptions/messages.js';
const FRIENDS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.FRIENDS;

// services
import authorizationService from '@services/authorization.js';

// models
import { UserRole } from '@models/../newModels/user.js';
import {
  Friend,
  GetFriendsRequest,
  GetFriendsResponse,
  GetFriendRequestsRequest,
  GetFriendRequestsResponse,
  GetPendingFriendsRequest,
  GetPendingFriendsResponse,
  DeleteFriendRequest,
  DeleteFriendResponse,
  DeletePendingFriendRequest,
  DeletePendingFriendResponse,
  CreateFriendRequest,
  CreateFriendResponse,
  AcceptFriendRequest,
  AcceptFriendResponse,
  DeclineFriendRequest,
  DeclineFriendResponse
} from '@models/../newModels/friend.js';

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Get friends
router.get(
  '/',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new friendsError.GetFriends());
      }

      const request: GetFriendsRequest = {
        before: req.query.before ? req.query.before.toString() : undefined,
        after: req.query.after ? req.query.after.toString() : undefined,
        limit: Number(req.query.limit)
      };

      const friends = await prismaFriend.findAllFriend(
        req.user.userId,
        request.before,
        request.after,
        request.limit
      );

      // Add username and delete the friendUserId
      const friendsWithUsername = await Promise.all(
        friends.map(async (friend) => {
          const friendUser = await prismaUser.findUserById(friend.friendUserId);
          const newFriend: Friend = {
            friendId: friend.friendId,
            createdAt: friend.createdAt,
            confirmedAt: friend.confirmedAt,
            username: friendUser ? friendUser?.username : ''
          };
          return newFriend;
        })
      );

      const response: GetFriendsResponse = {
        friends: friendsWithUsername,
        cursor: {
          before: friendsWithUsername.at(0)?.friendId,
          after: friendsWithUsername.at(-1)?.friendId
        }
      };
      res.status(200).json(response);
    }
  )
);

// Delete a friend
router.delete(
  '/:friendId',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const request: DeleteFriendRequest = {
        friendId: req.params.friendId
      };

      // Make sure you own the friend
      const friend = await prismaFriend.findFriendById(request.friendId);
      if (
        !friend ||
        !(
          friend.userId === req.user?.userId ||
          friend.friendUserId === req.user?.userId
        )
      ) {
        return next(new friendsError.DeleteFriend());
      }

      const deletedFriend = await prismaFriend.deleteFriendById(
        request.friendId
      );

      const response: DeleteFriendResponse = {};
      res.status(200).json(response);
    }
  )
);

// Get friends pending, requests that you SENT
router.get(
  '/pending',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const request: GetPendingFriendsRequest = {};

      if (!req.user) {
        return next(new friendsError.GetPendingFriendRequests());
      }

      const pendingFriends = await prismaFriend.findAllFriendPending(
        req.user.userId
      );

      // Add username and delete the friendUserId
      const pendingFriendsWithUsername = await Promise.all(
        pendingFriends.map(async (friend) => {
          const friendUser = await prismaUser.findUserById(friend.friendUserId);
          const newFriend: Friend = {
            friendId: friend.friendId,
            createdAt: friend.createdAt,
            confirmedAt: friend.confirmedAt,
            username: friendUser ? friendUser?.username : ''
          };
          return newFriend;
        })
      );

      const response: GetPendingFriendsResponse = {
        pendingFriends: pendingFriendsWithUsername
      };
      res.status(200).json(response);
    }
  )
);

// delete a pending friend
router.delete(
  '/pending/:friendId',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const request: DeletePendingFriendRequest = {
        friendId: req.params.friendId
      };

      // Make sure you own the friend
      const friend = await prismaFriend.findFriendById(request.friendId);
      if (
        !friend ||
        !(
          friend.userId === req.user?.userId ||
          friend.friendUserId === req.user?.userId
        )
      ) {
        return next(new friendsError.DeletePendingFriendRequest());
      }

      const response: DeletePendingFriendResponse = {};
      res.status(200).json(response);
    }
  )
);

// Get friend requests, requests that you RECEIVED
router.get(
  '/requests',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new friendsError.GetFriendRequests());
      }

      const request: GetFriendRequestsRequest = {};

      const friendRequests = await prismaFriend.findAllFriendRequest(
        req.user.userId
      );
      // Add username and delete the friendUserId
      const friendRequestsWithUsername = await Promise.all(
        friendRequests.map(async (friend) => {
          const friendUser = await prismaUser.findUserById(friend.friendUserId);
          const newFriend: Friend = {
            friendId: friend.friendId,
            createdAt: friend.createdAt,
            confirmedAt: friend.confirmedAt,
            username: friendUser ? friendUser?.username : ''
          };
          return newFriend;
        })
      );

      const response: GetFriendRequestsResponse = {
        friendRequests: friendRequestsWithUsername
      };
      res.status(200).json(response);
    }
  )
);

// Create a friend request
router.post(
  '/requests',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    if (!req.user || authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new friendsError.FriendExistsError());
    }

    const request: CreateFriendRequest = {
      username: req.body.username
    }

    accounts.getAccountByUsername(username).then(
      async (receiverId: any) => {
        // No account with this username
        if (receiverId[0] === undefined) {
          return next(
            new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.NO_USER, 400)
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
              friends.acceptFriendRequest(friendRequest[0].id, accountId).then(
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
));

// accept a friend request
router.post(
  '/requests/accept',
  rateLimiter.genericFriendLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { friendRequestId } = req.body;

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
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

export default router;
