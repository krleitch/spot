import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { LocationData } from '@models/../newModels/user.js';

const createLocation = async (
  userId: string,
  location: LocationData
): Promise<P.UserLocation> => {
  const createdLocation = await prisma.userLocation.create({
    data: {
      userId: userId,
      latitude: location.latitude,
      longitude: location.longitude
    }
  });
  return createdLocation;
};

// TODO: delete others and make a new one?
// const updateLocation = async (
//   userId: string,
//   location: LocationData
// ): Promise<P.UserLocation> => {
//   const updatedLocation = await prisma.userLocation.update({
//     where: {
//       userId: userId,
//     },
//     data: {
//       latitude: location.latitude,
//       longitude: location.longitude
//     }
//   });
//   return updatedLocation;
// };

const findLatestLocation = async (userId: string): Promise<P.UserLocation | null> => {
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
  findLatestLocation
};
