import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// db
import prismaNotification from '@db/prisma/notification.js';
import prismaUser from '@db/prisma/user.js';
import prismaSpot from '@db/prisma/spot.js';
import prismaComment from '@db/prisma/comment.js';
import prismaFriend from '@db/prisma/friend.js';

// services
import commentService from '@services/comment.js';
import authorizationService from '@services/authorization.js';

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// errors
import * as notificationError from '@exceptions/notification.js';
import ErrorHandler from '@helpers/errorHandler.js';

// models
import P from '@prisma/client';
import { UserRole } from '@models/user.js';
import {
  Notification,
  NotificationType,
  GetNotificationsRequest,
  GetNotificationsResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
  DeleteAllNotificationsRequest,
  DeleteAllNotificationsResponse,
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  SetAllNotificationsSeenRequest,
  SetAllNotificationsSeenResponse,
  SetNotificationSeenRequest,
  SetNotificationSeenResponse,
  GetUnseenNotificationsRequest,
  GetUnseenNotificationsResponse
} from '@models/notification.js';

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// get notifications for the user
router.get(
  '/',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const request: GetNotificationsRequest = {
        before: req.query.before?.toString(),
        after: req.query.after?.toString(),
        limit: Number(req.query.limit)
      };

      if (!req.user) {
        return next(new notificationError.GetNotifications());
      }

      const notifications = await prismaNotification.findAllNotification(
        req.user.userId,
        request.before,
        request.after,
        request.limit
      );

      // Add sender username, spot/comment/reply props
      const notifsWithProps = await Promise.all(
        notifications.map(async (notif) => {
          const newNotif: Notification = {
            notificationId: notif.notificationId,
            spotId: notif.spotId,
            commentId: notif.commentId,
            replyId: notif.commentId,
            createdAt: notif.createdAt,
            content: notif.content,
            seen: notif.seen,
            type: notif.type,
            tags: []
          };
          if (notif.senderId) {
            const user = await prismaUser.findUserById(notif.senderId);
            if (user) {
              newNotif.username = user.username;
            }
          }

          if (notif.spotId) {
            const spot = await prismaSpot.findSpotById(notif.spotId);
            if (spot) {
              newNotif.imageSrc = spot.imageSrc ? spot.imageSrc : undefined;
              newNotif.imageNsfw = spot.imageNsfw ? spot.imageNsfw : undefined;
              newNotif.link = spot.link;
            }
          }

          if (notif.commentId) {
            const comment = await prismaComment.findCommentById(
              notif.commentId
            );
            if (comment) {
              newNotif.commentImageSrc = comment.imageSrc
                ? comment.imageSrc
                : undefined;
              newNotif.commentImageNsfw = comment.imageNsfw
                ? comment.imageNsfw
                : undefined;
              newNotif.commentLink = comment.link;
            }
          }

          if (notif.replyId) {
            const reply = await prismaComment.findCommentById(notif.replyId);
            if (reply) {
              newNotif.replyImageSrc = reply.imageSrc
                ? reply.imageSrc
                : undefined;
              newNotif.replyImageNsfw = reply.imageNsfw
                ? reply.imageNsfw
                : undefined;
              newNotif.replyLink = reply.link;
            }
          }
          return newNotif;
        })
      );

      // Add the tags
      const notifsWithPropsAndTags =
        await commentService.addTagsToNotifications(
          notifsWithProps,
          req.user.userId
        );

      const response: GetNotificationsResponse = {
        notifications: notifsWithPropsAndTags,
        cursor: {
          before: notifications.at(0)?.notificationId,
          after: notifications.at(-1)?.notificationId
        }
      };
      res.status(200).json(response);
    }
  )
);

// Get number of unseen notifications
router.get(
  '/unseen',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new notificationError.GetUnseenNotifications());
      }

      const request: GetUnseenNotificationsRequest = {};
      const unseen = await prismaNotification.findTotalUnseenForReceiver(
        req.user.userId
      );

      const response: GetUnseenNotificationsResponse = { totalUnseen: unseen };
      res.status(200).json(response);
    }
  )
);

// Create a notification
router.post(
  '/',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (
        !req.user ||
        authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])
      ) {
        return next(new notificationError.SendNotification());
      }

      const request: CreateNotificationRequest = {
        receiver: req.body.receiver,
        content: req.body.content,
        type: req.body.type,
        spotId: req.body.spotId,
        commentId: req.body.commentId,
        replyId: req.body.replyId
      };

      const receiverUser = await prismaUser.findUserByUsername(
        request.receiver
      );
      // User must exist
      if (!receiverUser) {
        return next(new notificationError.SendNotification());
      }
      const friendExists = await prismaFriend.friendExists(
        req.user.userId,
        receiverUser.userId
      );
      // You must be friends
      if (!friendExists) {
        return next(new notificationError.SendNotification());
      }
      let createdTagNotification = await prismaNotification.createNotification(
        req.user.userId,
        receiverUser.userId,
        request.content,
        request.type,
        request.spotId ? request.spotId : undefined,
        request.commentId ? request.commentId : undefined,
        request.replyId ? request.replyId : undefined
      );

      // Add the tags
      const notifWithTags = await commentService.addTagsToNotifications(
        [
          {
            ...createdTagNotification,
            tags: []
          }
        ],
        req.user.userId
      );

      const response: CreateNotificationResponse = {
        notification: notifWithTags[0]
      };
      res.status(200).json(response);
    }
  )
);

// Set a notification as seen
router.put(
  '/:notificationId/seen',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new notificationError.SeenNotification());
      }

      const request: SetNotificationSeenRequest = {
        notificationId: req.params.notificationId
      };

      const notification = await prismaNotification.findNotificationById(
        request.notificationId
      );
      // You must own the notification
      if (!notification || notification.receiverId !== req.user.userId) {
        return next(new notificationError.SeenNotification());
      }

      await prismaNotification.updateNotificationSeen(request.notificationId);

      const response: SetNotificationSeenResponse = {};
      res.status(200).send(response);
    }
  )
);

// Set all notifications as seen
router.put(
  '/seen',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new notificationError.SeenAllNotification());
      }

      const request: SetAllNotificationsSeenRequest = {};

      await prismaNotification.updateAllNotificationSeen(req.user.userId);

      const response: SetAllNotificationsSeenResponse = {};
      res.status(200).send(response);
    }
  )
);

// Delete a single notification
router.delete(
  '/:notificationId',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new notificationError.DeleteNotification());
      }

      const request: DeleteNotificationRequest = {
        notificationId: req.params.notificationId
      };
      const notification = await prismaNotification.findNotificationById(
        request.notificationId
      );
      // You must own the notification
      if (!notification || notification.receiverId !== req.user.userId) {
        return next(new notificationError.DeleteNotification());
      }

      await prismaNotification.deleteNotificationById(request.notificationId);

      const response: DeleteNotificationResponse = {};
      res.status(200).send(response);
    }
  )
);

// Delete all notifications
router.delete(
  '/',
  rateLimiter.genericNotificationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new notificationError.DeleteAllNotification());
      }

      const request: DeleteAllNotificationsRequest = {};

      await prismaNotification.deleteAllNotificationForReceiver(
        req.user.userId
      );

      const response: DeleteAllNotificationsResponse = {};
      res.status(200).send(response);
    }
  )
);

export default router;
