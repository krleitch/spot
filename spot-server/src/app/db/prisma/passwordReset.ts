import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

const createPasswordReset = async (
  userId: string,
  token: string
): Promise<P.PasswordReset> => {
  const createdPasswordReset = await prisma.passwordReset.create({
    data: {
      userId: userId,
      token: token
    }
  });
  return createdPasswordReset;
};

const findByTokenAndLink = async (token: string, link: string): Promise<P.PasswordReset | null> => {
  const foundToken = await prisma.passwordReset.findFirst({
    where: {
      link: link,
      token: token
    }
  });
  return foundToken;
};

export default {
  createPasswordReset,
  findByTokenAndLink
};
