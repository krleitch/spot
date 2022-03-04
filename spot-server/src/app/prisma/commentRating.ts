import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { CommentRatingType } from '@models/../newModels/comment.js';
const mapToModelEnum = <T>(
  commentWithRating: Omit<T, 'rating'> & { rating: P.SpotRatingType }
): Omit<T, 'rating'> & { rating: CommentRatingType } => {
  return {
    ...commentWithRating,
    rating: CommentRatingType[commentWithRating.rating]
  };
};

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

const findRatingForUserAndComment = async (
  userId: string,
  commentId: string
): Promise<
  (Omit<P.CommentRating, 'rating'> & { rating: CommentRatingType }) | null
> => {
  const commentRating = await prisma.commentRating.findUnique({
    where: {
      userId_commentId: {
        commentId: commentId,
        userId: userId
      }
    }
  });
  return commentRating ? mapToModelEnum<P.CommentRating>(commentRating) : null;
};

export default {
  likeComment,
  dislikeComment,
  deleteRating,
  findRatingForUserAndComment
};
