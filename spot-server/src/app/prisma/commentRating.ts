import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { CommentRatingType } from '@models/../newModels/comment.js';

const likeComment = async (
  userId: string,
  commentId: string
): Promise<P.CommentRating> => {
  const commentRating = await prisma.commentRating.upsert({
    where: {
      userId_commentId: {
        commentId: commentId,
        userId: userId
      }
    },
    create: {
      commentId: commentId,
      userId: userId,
      rating: CommentRatingType.LIKE
    },
    update: {
      rating: CommentRatingType.LIKE
    }
  });
  return commentRating;
};

const dislikeComment = async (
  userId: string,
  commentId: string
): Promise<P.CommentRating> => {
  const commentRating = await prisma.commentRating.upsert({
    where: {
      userId_commentId: {
        commentId: commentId,
        userId: userId
      }
    },
    create: {
      commentId: commentId,
      userId: userId,
      rating: CommentRatingType.DISLIKE
    },
    update: {
      rating: CommentRatingType.DISLIKE
    }
  });
  return commentRating;
};

const deleteRating = async (
  userId: string,
  commentId: string
): Promise<P.CommentRating> => {
  const commentRating = await prisma.commentRating.delete({
    where: {
      userId_commentId: {
        commentId: commentId,
        userId: userId
      }
    }
  });
  return commentRating;
};

export default {
  likeComment,
  dislikeComment,
  deleteRating
};
