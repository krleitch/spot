import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { SpotRatingType } from '@models/spot.js';

const mapToModelEnum = <T>(
  spotWithRating: Omit<T, 'rating'> & { rating: P.SpotRatingType }
): Omit<T, 'rating'> & { rating: SpotRatingType } => {
  return {
    ...spotWithRating,
    rating: SpotRatingType[spotWithRating.rating]
  };
};

const rateSpot = async (
  userId: string,
  spotId: string,
  rating: SpotRatingType
): Promise<P.SpotRating> => {
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
      rating: rating
    },
    update: {
      rating: rating
    }
  });
  return spotRating;
};

const deleteRating = async (
  userId: string,
  spotId: string
): Promise<P.SpotRating> => {
  const spotRating = await prisma.spotRating.delete({
    where: {
      userId_spotId: {
        spotId: spotId,
        userId: userId
      }
    }
  });
  return spotRating;
};

const findRatingForUserAndSpot = async (
  userId: string,
  spotId: string
): Promise<
  (Omit<P.SpotRating, 'rating'> & { rating: SpotRatingType }) | null
> => {
  const spotRating = await prisma.spotRating.findUnique({
    where: {
      userId_spotId: {
        spotId: spotId,
        userId: userId
      }
    }
  });
  return spotRating ? mapToModelEnum<P.SpotRating>(spotRating) : null;
};

export default {
  rateSpot,
  deleteRating,
  findRatingForUserAndSpot
};
