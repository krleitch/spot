import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

const createFriend = async (
  userId: string,
  friendUserId: string
): Promise<P.Friend> => {
  const friend = await prisma.friend.create({
    data: {
      userId: userId,
      friendUserId: friendUserId
    }
  });
  return friend;
};

const findAllFriend = async (
  userId: string,
  before: string | undefined,
  after: string | undefined,
  limit: number
): Promise<P.Friend[]> => {
  const friend = await prisma.friend.findMany({
    where: {
      OR: [
        {
          userId: userId
        },
        {
          friendUserId: userId
        }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return friend;
};

const findFriendById = async (friendId: string): Promise<P.Friend | null> => {
  const friend = await prisma.friend.findUnique({
    where: {
      friendId: friendId
    }
  });
  return friend;
};

// Not confirmed, and you are the one who the request was sent to
const findAllFriendRequest = async (userId: string): Promise<P.Friend[]> => {
  const friendRequest = await prisma.friend.findMany({
    where: {
      AND: [
        {
          friendUserId: userId
        },
        {
          confirmedAt: null
        }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return friendRequest;
};

// Not confirmed, and you are the one who sent the request
const findAllFriendPending = async (userId: string): Promise<P.Friend[]> => {
  const friendPending = await prisma.friend.findMany({
    where: {
      AND: [
        {
          userId: userId
        },
        {
          confirmedAt: null
        }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return friendPending;
};

const deleteFriendById = async (friendId: string): Promise<P.Friend> => {
  const friend = await prisma.friend.delete({
    where: {
      friendId: friendId
    }
  });
  return friend;
};

const friendExists = async (
  firstUserId: string,
  secondUserId: string
): Promise<boolean> => {
  const exist = await prisma.friend.findFirst({
    where: {
      OR: [
        {
          userId: firstUserId,
          friendUserId: secondUserId
        },
        {
          userId: secondUserId,
          friendUserId: firstUserId
        }
      ]
    }
  });
  return exist ? true : false;
};

const findFriendRequest = async (
  firstUserId: string,
  secondUserId: string
): Promise<P.Friend | null> => {
  const exist = await prisma.friend.findFirst({
    where: {
      AND: [
        {
          OR: [
            {
              userId: firstUserId,
              friendUserId: secondUserId
            },
            {
              userId: secondUserId,
              friendUserId: firstUserId
            }
          ]
        },
        { confirmedAt: null }
      ]
    }
  });
  return exist;
};

// You are the one who the request was sent to, so you are friendUserId
const acceptFriendRequest = async (
  friendId: string
): Promise<P.Friend> => {
  const updatedFriend = await prisma.friend.update({
    where: {
      friendId: friendId,
    },
    data: {
      confirmedAt: new Date()
    }
  });
  return updatedFriend;
};

// You are the one who the request was sent to, so you are friendUserId
const declineFriendRequest = async (
  friendId: string
): Promise<P.Friend> => {
  const deletedFriend = await prisma.friend.delete({
    where: {
      friendId: friendId
    }
  });
  return deletedFriend;
};

export default {
  createFriend,
  findAllFriend,
  findFriendById,
  findAllFriendRequest,
  findAllFriendPending,
  deleteFriendById,
  friendExists,
  findFriendRequest,
  acceptFriendRequest,
  declineFriendRequest
};
