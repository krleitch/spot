import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { LocationData } from '@models/../newModels/location.js';

const createLocation = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<P.UserLocation> => {
  const createdLocation = await prisma.userLocation.create({
    data: {
      userId: userId,
      latitude: latitude,
      longitude: longitude
    }
  });
  return createdLocation;
};

// TODO: delete others and make a new one?
const updateLatestLocation = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<P.UserLocation> => {

  const latestLocation = await findLatestLocation(userId);

  const updatedLocation = await prisma.userLocation.upsert({
    where: {
      userLocationId: latestLocation?.userLocationId
    },
    update: {
      latitude: latitude,
      longitude: longitude
    },
    create: {
      userId: userId,
      latitude: latitude,
      longitude: longitude
    }
  });
  return updatedLocation;
};

const findLatestLocation = async (
  userId: string
): Promise<P.UserLocation | null> => {
  const location = prisma.userLocation.findFirst({
    where: {
      userId: userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return location;
};

export default {
  createLocation,
  updateLatestLocation,
  findLatestLocation
};
