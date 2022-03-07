import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { Comment } from '@models/../newModels/comment.js';

import { COMMENT_CONSTANTS } from '@constants/comment.js';

const createComment = async (
  commentId: string,
  spotId: string,
  userId: string,
  content: string,
  imageSrc: string | null,
  imageNsfw: boolean,
  link: string
): Promise<P.Comment> => {
  const comment = await prisma.comment.create({
    data: {
      commentId: commentId,
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
  commentId: string,
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
      commentId: commentId,
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

const findRepliesForComment = async (
  spotId: string,
  parentCommentId: string,
  before: string | undefined,
  after: string | undefined,
  limit: number,
  userId?: string
): Promise<P.Comment[]> => {
  const comment = await prisma.comment.findMany({
    where: {
      spotId: spotId,
      parentCommentId: parentCommentId,
      deletedAt: null,
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

const findTotalRepliesAfterReply = async (
  spotId: string,
  parentCommentId: string,
  replyId: string,
): Promise<number> => {
  const totalBefore = await prisma.comment.count({
    where: {
      spotId: spotId,
      parentCommentId: parentCommentId
    },
    cursor: {
      commentId: replyId
    }
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

const softDeleteReplyByParentId = async (
  parentCommentId: string
): Promise<number> => {
  const comment = await prisma.comment.updateMany({
    where: {
      parentCommentId: parentCommentId
    },
    data: {
      deletedAt: new Date()
    }
  });
  return comment.count;
};

const linkExists = async (link: string): Promise<boolean> => {
  const exists = await prisma.comment.findUnique({
    where: {
      link: link
    }
  });
  return exists ? true : false;
};

const userOwnsComment = async (userId: string, commentId: string): Promise<boolean> => {
  const comment = await prisma.comment.findUnique({
    where: {
      commentId: commentId
    }
  });
  return comment ? comment.owner === userId : false;
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
  before: string | undefined,
  after: string | undefined,
  limit: number
): Promise<P.Comment[]> => {
  const maxActivityBeforeDate = new Date();
  maxActivityBeforeDate.setDate(
    maxActivityBeforeDate.getDate() - COMMENT_CONSTANTS.ACTIVITY_DAYS
  );

  const comment = await prisma.comment.findMany({
    where: {
      owner: userId,
      deletedAt: null,
      createdAt: {
        gt: maxActivityBeforeDate
      }
    },
    cursor: {
      commentId: after
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: before ? -limit : limit,
    skip: before || after ? 1 : 0
  });
  return comment;
};

export default {
  createComment,
  createReply,
  findCommentForSpot,
  findRepliesForComment,
  findCommentById,
  findCommentByLink,
  findTotalCommentsAfterDate,
  findTotalCommentsBeforeDate,
  findTotalRepliesAfterReply,
  softDeleteComment,
  softDeleteReplyByParentId,
  linkExists,
  userOwnsComment,
  updateNsfw,
  findCommentActivity
};
