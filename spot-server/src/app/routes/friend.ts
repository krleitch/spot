import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// db
import prismaUser from '@db/prisma/user.js';
import prismaFriend from '@db/prisma/friend.js';

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// errors
import * as friendsError from '@exceptions/friend.js';
import ErrorHandler from '@helpers/errorHandler.js';
import { ERROR_MESSAGES } from '@exceptions/messages.js';
const FRIENDS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.FRIENDS;

// services
import authorizationService from '@services/authorization.js';

// models
import { UserRole, User } from '@models/user.js';
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
} from '@models/friend.js';
import P from '@prisma/client';

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
          let friendUser: User | null;
          if (friend.userId === req.user?.userId) {
            friendUser = await prismaUser.findUserById(friend.friendUserId);
          } else {
            friendUser = await prismaUser.findUserById(friend.userId);
          }
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
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.user ||
        authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])
      ) {
        return next(new friendsError.FriendExistsError());
      }

      const request: CreateFriendRequest = {
        username: req.body.username
      };

      const friendUser = await prismaUser.findUserByUsername(request.username);
      if (!friendUser) {
        return new friendsError.UsernameError(
          FRIENDS_ERROR_MESSAGES.NO_USER,
          400
        );
      }
      // You cannot add yourself
      if (friendUser.userId === req.user.userId) {
        return next(
          new friendsError.UsernameError(FRIENDS_ERROR_MESSAGES.SELF, 400)
        );
      }
      // You are already friends
      const friendExists = await prismaFriend.friendExists(
        req.user.userId,
        friendUser.userId
      );
      if (friendExists) {
        return next(new friendsError.FriendExistsError());
      }
      const friendRequest = await prismaFriend.findFriendRequest(
        req.user.userId,
        friendUser.userId
      );
      let createdFriend: P.Friend;
      if (friendRequest) {
        // You sent the request
        if (friendRequest.userId === req.user.userId) {
          new friendsError.UsernameError(
            FRIENDS_ERROR_MESSAGES.REQUEST_EXISTS,
            400
          );
        }
        // Otherwise you were sent the request, so accept
        createdFriend = await prismaFriend.acceptFriendRequest(req.user.userId);
      } else {
        // Create a new friend request
        createdFriend = await prismaFriend.createFriend(
          req.user.userId,
          friendUser.userId
        );
      }

      const response: CreateFriendResponse = {
        friend: {
          friendId: createdFriend.friendId,
          createdAt: createdFriend.createdAt,
          confirmedAt: createdFriend.confirmedAt,
          username: friendUser.username
        }
      };
      res.status(200).json(response);
    }
  )
);

// accept a friend request
router.post(
  '/requests/accept',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.user ||
        authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])
      ) {
        return next(new friendsError.AcceptFriendRequest());
      }

      const request: AcceptFriendRequest = {
        friendRequestId: req.body.friendRequestId
      };

      const friendRequest = await prismaFriend.findFriendById(
        request.friendRequestId
      );
      if (friendRequest?.friendUserId !== req.user.userId) {
        return next(new friendsError.AcceptFriendRequest());
      }
      const acceptedFriend = await prismaFriend.acceptFriendRequest(
        request.friendRequestId
      );

      const friendUser = await prismaUser.findUserById(acceptedFriend.userId);

      const response: AcceptFriendResponse = {
        friend: {
          friendId: acceptedFriend.friendId,
          createdAt: acceptedFriend.createdAt,
          confirmedAt: acceptedFriend.confirmedAt,
          username: friendUser ? friendUser.username : ''
        }
      };
      res.status(200).json(response);
    }
  )
);

// decline a friend request
router.post(
  '/requests/decline',
  rateLimiter.genericFriendLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.user ||
        authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])
      ) {
        return next(new friendsError.DeclineFriendRequest());
      }

      const request: DeclineFriendRequest = {
        friendRequestId: req.body.friendRequestId
      };
      const friendRequest = await prismaFriend.findFriendById(
        request.friendRequestId
      );
      if (friendRequest?.friendUserId !== req.user.userId) {
        return next(new friendsError.DeclineFriendRequest());
      }
      await prismaFriend.declineFriendRequest(request.friendRequestId);

      const response: DeclineFriendResponse = {};
      res.status(200).json(response);
    }
  )
);

export default router;
