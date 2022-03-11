import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

// Db
import prismaSpotRating from '@db/prisma/spotRating.js';

// Services
import locationService from '@services/location.js';

// Models
import { Spot, SpotRatingType } from '@models/spot.js';
import { SearchType, LocationType } from '@models/userMetadata.js';
import { LocationData } from '@models/location.js';

// Constants
import { SPOT_CONSTANTS } from '@constants/spot.js';
import { LOCATION_CONSTANTS } from '@constants/location.js';

// Types for adding location to spots
type LocationProps = {
  inRange: boolean;
  distance: number;
};
type RatingProps = {
  myRating: SpotRatingType;
  owned: boolean;
};

const createSpot = async (
  spotId: string,
  userId: string,
  content: string,
  location: LocationData,
  imageSrc: string | null,
  imageNsfw: boolean,
  link: string,
  geolocation: string
): Promise<P.Spot> => {
  const spot = await prisma.spot.create({
    data: {
      spotId: spotId,
      latitude: location.latitude,
      longitude: location.longitude,
      content: content,
      link: link,
      imageSrc: imageSrc,
      imageNsfw: imageNsfw,
      owner: userId,
      geolocation: geolocation
    }
  });
  return spot;
};

const findSpots = async (
  userId: string,
  searchType: SearchType,
  locationType: LocationType,
  location: LocationData,
  limit: number,
  before: string | undefined,
  after: string | undefined
): Promise<Spot[]> => {
  // Get the spots
  let spots: P.Spot[];
  if (searchType === SearchType.HOT) {
    spots = await _findHotSpots(before, after, limit);
  } else {
    spots = await _findNewSpots(before, after, limit);
  }
  // Filter the locations and add distance
  const spotsWithLocation = spots.reduce(
    (filtered: Array<P.Spot & LocationProps>, spot: P.Spot) => {
      const distance = locationService.distanceBetweenTwoLocations(
        location.latitude,
        location.longitude,
        Number(spot.latitude),
        Number(spot.longitude),
        'M'
      );
      if (distance < LOCATION_CONSTANTS.IN_RANGE_DISTANCE) {
        filtered.push({
          ...spot,
          distance: Math.max(LOCATION_CONSTANTS.MIN_DISTANCE, distance),
          inRange: true
        });
      } else {
        // Only if searching globally, since you are not in range
        if (locationType === LocationType.GLOBAL) {
          filtered.push({
            ...spot,
            distance: Math.max(LOCATION_CONSTANTS.MIN_DISTANCE, distance),
            inRange: false
          });
        }
      }
      return filtered;
    },
    []
  );
  // Add the user rating
  const spotsWithLocationAndRating: Array<
    P.Spot & LocationProps & RatingProps
  > = await Promise.all(
    spotsWithLocation.map(async (spot) => {
      const spotRating = await prismaSpotRating.findRatingForUserAndSpot(
        userId,
        spot.spotId
      );
      return {
        ...spot,
        myRating: spotRating ? spotRating.rating : SpotRatingType.NONE,
        owned: spot.owner === userId
      };
    })
  );
  // Remove The Properties we Dont want
  const clientSpots: Spot[] = spotsWithLocationAndRating.map((spot) => {
    return {
      spotId: spot.spotId,
      createdAt: spot.createdAt,
      deletedAt: spot.deletedAt,
      distance: spot.distance,
      inRange: spot.inRange,
      geolocation: spot.geolocation,
      content: spot.content,
      imageSrc: spot.imageSrc,
      imageNsfw: spot.imageNsfw,
      likes: spot.likes,
      dislikes: spot.dislikes,
      myRating: spot.myRating,
      totalComments: spot.totalComments,
      link: spot.link,
      owned: spot.owned
    };
  });
  return clientSpots;
};

const _findHotSpots = async (
  before: string | undefined,
  after: string | undefined,
  limit: number
) => {
  let spots: P.Spot[];
  if (!before && !after) {
    spots = await prisma.spot.findMany({
      orderBy: {
        hotRanking: 'desc'
      },
      take: limit
    });
  } else {
    if (before && after) {
      // Not allowed
      return [];
    }
    spots = await prisma.spot.findMany({
      orderBy: {
        hotRanking: 'desc'
      },
      cursor: {
        spotId: after ? after : before
      },
      skip: 1, // skip the cursor
      take: limit * (before ? -1 : 1) // take forwards or backwards
    });
  }
  return spots;
};

const _findNewSpots = async (
  before: string | undefined,
  after: string | undefined,
  limit: number
) => {
  let spots: P.Spot[];
  if (!before && !after) {
    spots = await prisma.spot.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  } else {
    if (before && after) {
      // Not allowed
      return [];
    }
    spots = await prisma.spot.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      cursor: {
        spotId: after ? after : before
      },
      skip: 1, // skip the cursor
      take: limit * (before ? -1 : 1) // take forwards or backwards
    });
  }
  return spots;
};

const findSpotById = async (
  spotId: string,
  userId?: string
): Promise<P.Spot | null> => {
  const spot = await prisma.spot.findUnique({
    where: {
      spotId: spotId
    }
  });
  return spot;
};

const findSpotByLink = async (
  link: string,
  userId?: string | null
): Promise<P.Spot | null> => {
  const spot = await prisma.spot.findUnique({
    where: {
      link: link
    }
  });
  return spot;
};

const softDeleteSpot = async (spotId: string): Promise<P.Spot> => {
  const spot = await prisma.spot.delete({
    where: {
      spotId: spotId
    }
  });
  return spot;
};

const linkExists = async (link: string): Promise<boolean> => {
  const exists = await prisma.spot.findUnique({
    where: {
      link: link
    }
  });
  return exists ? true : false;
};

const updateNsfw = async (
  spotId: string,
  imageNsfw: boolean
): Promise<P.Spot> => {
  const updatedSpot = prisma.spot.update({
    where: {
      spotId: spotId
    },
    data: {
      imageNsfw: imageNsfw
    }
  });
  return updatedSpot;
};

// Activity

const findSpotActivity = async (
  userId: string,
  before: string | undefined,
  after: string | undefined,
  limit: number,
  location: LocationData
): Promise<P.Spot[]> => {
  const maxActivityBeforeDate = new Date();
  maxActivityBeforeDate.setDate(
    maxActivityBeforeDate.getDate() - SPOT_CONSTANTS.ACTIVITY_DAYS
  );
  let spot: P.Spot[];
  if (!before && !after) {
    spot = await prisma.spot.findMany({
      where: {
        owner: userId,
        deletedAt: null,
        createdAt: {
          gt: maxActivityBeforeDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  } else {
    if (before && after) {
      return [];
    }
    spot = await prisma.spot.findMany({
      where: {
        owner: userId,
        deletedAt: null,
        createdAt: {
          gt: maxActivityBeforeDate
        }
      },
      cursor: {
        spotId: after ? after : before
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: 1,
      take: limit * (before ? -1 : 1)
    });
  }
  return spot;
};

export default {
  createSpot,
  findSpots,
  findSpotById,
  findSpotByLink,
  softDeleteSpot,
  linkExists,
  updateNsfw,
  findSpotActivity
};
