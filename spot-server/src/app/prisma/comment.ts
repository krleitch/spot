import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { Comment } from '@models/../newModels/comment.js';

import { COMMENT_CONSTANTS } from '@constants/comment.js';

const createComment = async (
  spotId: string,
  userId: string,
  content: string,
  imageSrc: string | null,
  imageNsfw: boolean,
  link: string
): Promise<P.Comment> => {
  const comment = await prisma.comment.create({
    data: {
      spotId: spotId,
      owner: userId,
      content: content,
      link: link,
      imageSrc: imageSrc,
      imageNsfw: imageNsfw
    }
  });
  return comment;
};

const createReply = async (
  spotId: string,
  userId: string,
  parentCommentId: string,
  content: string,
  imageSrc: string,
  imageNsfw: boolean,
  link: string
): Promise<P.Comment> => {
  const comment = await prisma.comment.create({
    data: {
      spotId: spotId,
      owner: userId,
      parentCommentId: parentCommentId,
      content: content,
      link: link,
      imageSrc: imageSrc,
      imageNsfw: imageNsfw
    }
  });
  return comment;
};

const findCommentForSpot = async (
  spotId: string,
  before: string | undefined,
  after: string | undefined,
  limit: number,
  userId?: string
): Promise<P.Comment[]> => {
  const comment = await prisma.comment.findMany({
    where: {
      spotId: spotId,
      deletedAt: null,
      createdAt: {
        lt: after,
        gt: before
      }
    },
    orderBy: {
      createdAt: after ? 'asc' : 'desc'
    },
    cursor: {
      commentId: after ? after : before
    },
    skip: (after || before) ? 1 : 0, // skip the cursor
    take: limit * (before ? - 1 : 1) // take forwards or backwards
  });
  return comment;
};

const findCommentForComment = async (
  spotId: string,
  parentCommentId: string,
  before: Date,
  after: Date,
  limit: number,
  userId?: string
): Promise<P.Comment[]> => {
  const comment = await prisma.comment.findMany({
    where: {
      spotId: spotId,
      parentCommentId: parentCommentId,
      deletedAt: null,
      createdAt: {
        lt: after,
        gt: before
      }
    },
    orderBy: {
      createdAt: after ? 'asc' : 'desc'
    },
    take: limit
  });
  return comment;
};

const findCommentById = async (
  commentId: string,
  userId?: string
): Promise<P.Comment | null> => {
  const comment = await prisma.comment.findUnique({
    where: {
      commentId: commentId
    }
  });
  return comment;
};

const findCommentByLink = async (
  link: string,
  userId?: string
): Promise<P.Comment | null> => {
  const comment = await prisma.comment.findUnique({
    where: {
      link: link
    }
  });
  return comment;
};

const findTotalCommentsAfterDate = async (
  spotId: string,
  after: Date | undefined,
): Promise<number> => {
  const totalAfter = await prisma.comment.count({
    where: {
      spotId: spotId,
      createdAt: {
        gt: after
      }
    },
  });
  return totalAfter;
};

const findTotalCommentsBeforeDate = async (
  spotId: string,
  before: Date | undefined,
): Promise<number> => {
  const totalBefore = await prisma.comment.count({
    where: {
      spotId: spotId,
      createdAt: {
        lt: before
      }
    },
  });
  return totalBefore;
};

const softDeleteComment = async (
  commentId: string
): Promise<P.Comment | null> => {
  const comment = await prisma.comment.update({
    where: {
      commentId: commentId
    },
    data: {
      deletedAt: new Date()
    }
  });
  return comment;
};

const linkExists = async (link: string): Promise<boolean> => {
  const exists = await prisma.comment.findUnique({
    where: {
      link: link
    }
  });
  return exists ? true : false;
};

const updateNsfw = async (
  commentId: string,
  imageNsfw: boolean
): Promise<P.Comment> => {
  const updatedComment = prisma.comment.update({
    where: {
      commentId: commentId
    },
    data: {
      imageNsfw: imageNsfw
    }
  });
  return updatedComment;
};

// Activity
const findCommentActivity = async (
  userId: string,
  before: Date | undefined,
  after: Date | undefined,
  limit: number
): Promise<P.Comment[]> => {
  const maxActivityBeforeDate = new Date();
  maxActivityBeforeDate.setDate(
    maxActivityBeforeDate.getDate() - COMMENT_CONSTANTS.ACTIVITY_DAYS
  );
  before =
    before && before > maxActivityBeforeDate ? before : maxActivityBeforeDate;

  const comment = await prisma.comment.findMany({
    where: {
      owner: userId,
      deletedAt: null,
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
  return comment;
};

export default {
  createComment,
  createReply,
  findCommentForSpot,
  findCommentForComment,
  findCommentById,
  findCommentByLink,
  findTotalCommentsAfterDate,
  findTotalCommentsBeforeDate,
  softDeleteComment,
  linkExists,
  updateNsfw,
  findCommentActivity
};
