import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

const createVerifyUser = async (
  userId: string,
  token: string
): Promise<P.UserVerify> => {
  const createdVerify = await prisma.userVerify.create({
    data: {
      userId: userId,
      token: token
    }
  });
  return createdVerify;
};

const findByToken = async (token: string): Promise<P.UserVerify | null> => {
  const verifyUser = prisma.userVerify.findUnique({
    where: {
      token: token
    }
  });
  return verifyUser;
};

export default {
  createVerifyUser,
  findByToken
};
