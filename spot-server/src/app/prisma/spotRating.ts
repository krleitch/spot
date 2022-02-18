
import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { SpotRatingType } from '@models/../newModels/spot';

const likeSpot = async (userId: string, spotId: string): Promise<P.SpotRating> => {
  const spotRating = await prisma.spotRating.upsert({
    where: {
      userId_spotId: {
        spotId: spotId,
        userId: userId
      }
    },
    create: {
      spotId: spotId,
      userId: userId,
      rating: SpotRatingType.LIKE
    },
    update: {
      rating: SpotRatingType.LIKE
    }
  });
  return spotRating;
}

const dislikeSpot = async (userId: string, spotId: string): Promise<P.SpotRating> => {
  const spotRating = await prisma.spotRating.upsert({
    where: {
      userId_spotId: {
        spotId: spotId,
        userId: userId
      }
    },
    create: {
      spotId: spotId,
      userId: userId,
      rating: SpotRatingType.DISLIKE
    },
    update: {
      rating: SpotRatingType.DISLIKE
    }
  });
  return spotRating;
}

const deleteRating = async (userId: string, spotId: string): Promise<P.SpotRating> => {
  const spotRating = await prisma.spotRating.delete({
    where: {
      userId_spotId: {
        spotId: spotId,
        userId: userId
      }
    }
  })
  return spotRating;
}

export default {
  likeSpot,
  dislikeSpot,
  deleteRating
}