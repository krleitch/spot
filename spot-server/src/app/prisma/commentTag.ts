import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

const createTag = async (
  userId: string,
  taggerId: string,
  spotId: string,
  commentId: string,
  commentParentId: string,
  offset: number
): Promise<P.CommentTag> => {
  const createdTag = await prisma.commentTag.create({
    data: {
      userId: userId,
      taggerId: taggerId,
      spotId: spotId,
      commentId: commentId,
      commentParentId: commentParentId,
      offset: offset
    }
  });
  return createdTag;
};

const findTagsByCommentId = async (commentId: string): Promise<P.CommentTag[]> => {
  const tags = await prisma.commentTag.findMany({
    where: {
      commentId: commentId
    }
  });
  return tags;
}

const taggedInCommentChain = async (commentParentId: string, userId: string): Promise<boolean> => {
  const tagged = await prisma.commentTag.findFirst({
    where: {
      commentParentId: commentParentId,
      userId: userId
    }
  });
  return tagged ? true : false;
}


export default {
  createTag,
  findTagsByCommentId,
  taggedInCommentChain
};
