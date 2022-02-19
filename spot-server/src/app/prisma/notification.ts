import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { NotificationType } from '@models/../newModels/notification.js';

const createTagSpotNotification = async (
  senderId: string,
  receiverId: string,
  spotId: string
): Promise<P.Notification> => {
  const notification = await prisma.notification.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
      spotId: spotId,
      type: NotificationType.TAG
    }
  });
  return notification;
};

const createTagCommentNotification = async (
  senderId: string,
  receiverId: string,
  spotId: string,
  commentId: string
): Promise<P.Notification> => {
  const notification = await prisma.notification.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
      spotId: spotId,
      commentId: commentId,
      type: NotificationType.TAG
    }
  });
  return notification;
};
const createTagReplyNotification = async (
  senderId: string,
  receiverId: string,
  spotId: string,
  commentId: string,
  replyId: string
): Promise<P.Notification> => {
  const notification = await prisma.notification.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
      spotId: spotId,
      commentId: commentId,
      replyId: replyId,
      type: NotificationType.TAG
    }
  });
  return notification;
};
const findAllNotification = async (
  receiverId: string,
  before: Date | undefined,
  after: Date | undefined,
  limit: number
): Promise<P.Notification[]> => {
  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: receiverId,
      createdAt: {
        lt: after,
        gt: before
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
  return notifications;
};

const findNotificationById = async (
  notificationId: string
): Promise<P.Notification | null> => {
  const notification = await prisma.notification.findUnique({
    where: {
      notificationId: notificationId
    }
  });
  return notification;
};

const findTotalUnreadForReceiver = async (
  receiverId: string
): Promise<number> => {
  const unread = await prisma.notification.count({
    where: {
      receiverId: receiverId,
      seen: false
    }
  });
  return unread;
}

const updateNotificationSeen = async (
  notificationId: string
): Promise<P.Notification | null> => {
  const notification = await prisma.notification.update({
    where: {
      notificationId: notificationId
    },
    data: {
      seen: true
    }
  });
  return notification;
};

const updateAllNotificationSeen = async (
  receiverId: string
): Promise<number> => {
  const notification = await prisma.notification.updateMany({
    where: {
      receiverId: receiverId
    },
    data: {
      seen: true
    }
  });
  return notification.count;
};


const deleteNotificationById = async (
  notificationId: string
): Promise<P.Notification | null> => {
  const notification = await prisma.notification.delete({
    where: {
      notificationId: notificationId
    }
  });
  return notification;
};

const deleteAllNotificationForReceiver = async (
  receiverId: string
): Promise<number> => {
  const notification = await prisma.notification.deleteMany({
    where: {
      receiverId: receiverId
    }
  });
  return notification.count;
};

export default {
  createTagSpotNotification,
  createTagCommentNotification,
  createTagReplyNotification,
  findAllNotification,
  findNotificationById,
  findTotalUnreadForReceiver,
  updateNotificationSeen,
  updateAllNotificationSeen,
  deleteNotificationById,
  deleteAllNotificationForReceiver
};
