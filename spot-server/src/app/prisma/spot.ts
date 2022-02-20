import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import { Spot } from '@models/../newModels/spot.js';
import { SearchType, LocationType } from '@models/../newModels/userMetadata';
import { LocationData } from '@models/../newModels/location.js';

import { SPOT_CONSTANTS } from '@constants/spot.js';

const createSpot = async (
  userId: string,
  content: string,
  location: LocationData,
  imageSrc: string,
  imageNsfw: boolean,
  link: string,
  geolocation: string
): Promise<P.Spot> => {
  const spot = await prisma.spot.create({
    data: {
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

// TODO: Add cursor pagination
const findSpots = async (
  userId: string,
  searchType: SearchType,
  locationType: LocationType,
  location: LocationData,
  offset: number,
  limit: number,
  date: Date
): Promise<P.Spot[]> => {
  const spots = await prisma.spot.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    skip: offset,
    take: limit
  });
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
  userId?: string
): Promise<P.Spot | null> => {
  const spot = await prisma.spot.findUnique({
    where: {
      link: link
    }
  });
  return spot;
};

const softDeleteSpot = async (spotId: string): Promise<P.Spot | null> => {
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
  before: Date | undefined,
  after: Date | undefined,
  limit: number
): Promise<P.Spot[] | null> => {
  const maxActivityBeforeDate = new Date();
  maxActivityBeforeDate.setDate(
    maxActivityBeforeDate.getDate() - SPOT_CONSTANTS.ACTIVITY_DAYS
  );
  before =
    before && before > maxActivityBeforeDate ? before : maxActivityBeforeDate;

  const spot = await prisma.spot.findMany({
    where: {
      owner: userId,
      deletedAt: null,
      createdAt: {
        lt: after,
        gt: before
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
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
