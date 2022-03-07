import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { NotificationType } from '@models/../newModels/notification.js';

const mapToModelEnum = <T>(
  userWithType: Omit<T, 'type'> & { type: P.NotificationType }
): Omit<T, 'type'> & { type: NotificationType } => {
  return {
    ...userWithType,
    type: NotificationType[userWithType.type]
  };
};

const createTagSpotNotification = async (
  senderId: string,
  receiverId: string,
  spotId: string
) => {
  const notification = await prisma.notification.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
      spotId: spotId,
      type: NotificationType.TAG
    }
  });
  return mapToModelEnum<P.Notification>(notification);
};

const createTagCommentNotification = async (
  senderId: string,
  receiverId: string,
  spotId: string,
  commentId: string
) => {
  const notification = await prisma.notification.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
      spotId: spotId,
      commentId: commentId,
      type: NotificationType.TAG
    }
  });
  return mapToModelEnum<P.Notification>(notification);
};

const createTagReplyNotification = async (
  senderId: string,
  receiverId: string,
  spotId: string,
  commentId: string,
  replyId: string
) => {
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
  return mapToModelEnum<P.Notification>(notification);
};

const findAllNotification = async (
  receiverId: string,
  before: string | undefined,
  after: string | undefined,
  limit: number
) => {
  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: receiverId
    },
    cursor: {
      notificationId: after
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: before ? -limit : limit,
    skip: before || after ? 1 : 0
  });
  return notifications.map((notification) => {
    return mapToModelEnum<P.Notification>(notification);
  });
};

const findNotificationById = async (notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: {
      notificationId: notificationId
    }
  });
  return notification ? mapToModelEnum<P.Notification>(notification) : null;
};

const findTotalUnseenForReceiver = async (
  receiverId: string
): Promise<number> => {
  const unread = await prisma.notification.count({
    where: {
      receiverId: receiverId,
      seen: false
    }
  });
  return unread;
};

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
) => {
  const notification = await prisma.notification.delete({
    where: {
      notificationId: notificationId
    }
  });
  return mapToModelEnum<P.Notification>(notification);
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
  findTotalUnseenForReceiver,
  updateNotificationSeen,
  updateAllNotificationSeen,
  deleteNotificationById,
  deleteAllNotificationForReceiver
};
