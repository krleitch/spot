import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { UserImageType } from '@models/image.js';

// Change the prisma enum to the model enum
const mapToModelEnum = <T>(
  userWithType: Omit<T, 'type'> & { type: P.ImageType }
): Omit<T, 'type'> & { type: UserImageType } => {
  return {
    ...userWithType,
    type: UserImageType[userWithType.type]
  };
};

const createUserImage = async (
  userId: string,
  imageSrc: string,
  type: UserImageType
): Promise<P.UserImage> => {
  const createdUserImage = await prisma.userImage.create({
    data: {
      userId: userId,
      imageSrc: imageSrc,
      type: type
    }
  });
  return createdUserImage;
};

const findByUserId = async (userId: string): Promise<P.UserImage[]> => {
  const userImages = await prisma.userImage.findMany({
    where: {
      userId: userId
    }
  });
  return userImages.map((x) => mapToModelEnum<P.UserImage>(x));
};

const deleteUserImage = async (userImageId: string): Promise<P.UserImage> => {
  const userImage = await prisma.userImage.update({
    where: {
      userImageId: userImageId
    },
    data: {
      deletedAt: new Date()
    }
  });
  return mapToModelEnum<P.UserImage>(userImage);
};

export default {
  createUserImage,
  findByUserId,
  deleteUserImage
};
