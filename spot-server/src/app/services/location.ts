import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// config
import googleconfig from '@config/googlekey.js';
import config from '@config/config.js';

// db
import redisClient from '@db/redis.js';
import prismaUserLocation from '@db/prisma/userLocation.js';

// error
import * as locationError from '@exceptions/location.js';

// services
import authorizationService from '@services/authorization.js';

// constants
import { LOCATION_CONSTANTS } from '@constants/location.js';

// models
import { LocationData } from '@models/location.js';
import { UserRole } from '@models/user.js';
import P from '@prisma/client';
import { GeoReplyWith } from '@node-redis/client/dist/lib/commands/generic-transformers.js';

// Middleware which checks the given locationData to make sure it is accurate
const checkLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if you aren't logged in then verifying your location doesn't matter
  if (!req.user) {
    return next();
  }
  // allow admins and guests to do whatever
  if (
    authorizationService.checkUserHasRole(req.user, [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.GUEST
    ])
  ) {
    return next();
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  // for get requests
  if (req.query) {
    latitude = Number(req.query.latitude);
    longitude = Number(req.query.longitude);
  }
  // for post requests
  const { location } = req.body;
  if (location) {
    latitude = location.latitude;
    longitude = location.longitude;
  }
  // No location info, go next
  if (!latitude || !longitude) {
    return next();
  }

  const valid = await verifyLocation(req.user.userId, latitude, longitude);
  if (!valid) {
    return next(new locationError.LocationError());
  }
  // We have a new valid location, update it
  await prismaUserLocation.updateLatestLocation(
    req.user.userId,
    latitude,
    longitude
  );
  return next();
};

// Returns true/false if the location given is accurate for the user
const verifyLocation = async (
  userId: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  const latestLocation = await prismaUserLocation.findLatestLocation(userId);
  if (!latestLocation) {
    // No previous location, so add a new location
    await prismaUserLocation.createLocation(userId, latitude, longitude);
    return true;
  }

  // If the time delay has passed, then any location is valid
  const curTime = new Date().valueOf();
  const timeAnyLocationIsValid = new Date(
    latestLocation.createdAt.valueOf() +
      LOCATION_CONSTANTS.MAX_TIME_CHANGE * 3600000
  ).valueOf();
  if (curTime >= timeAnyLocationIsValid) {
    return true;
  }

  // If you have travelled too far, then you are obviously faking location
  const numHoursPassed =
    (curTime - latestLocation.createdAt.valueOf()) / 3600000;
  const maxDistanceChangeAllowed =
    LOCATION_CONSTANTS.MAX_DISTANCE_CHANGE * numHoursPassed;
  const minDistanceChangeAllowed = 1; // anything under 1 is meaningless
  const distance = distanceBetweenTwoLocations(
    latitude,
    longitude,
    Number(latestLocation.latitude),
    Number(latestLocation.longitude),
    'M'
  );
  return (
    distance <= Math.max(minDistanceChangeAllowed, maxDistanceChangeAllowed)
  );
};

// Take a P.Spot, remove the lat and long and add locationProps
type locationProps = {
  inRange: boolean;
  distance: number;
};
type spotWithLocation = Omit<P.Spot, 'latitude' | 'longitude'> & locationProps;
const addLocationPropsToSpots = (
  spots: P.Spot[],
  location: LocationData,
  options: { hideDistance: boolean }
): spotWithLocation[] => {
  const newSpots = spots.map((spot: P.Spot) => {
    // remove the latitude and longitude
    const { latitude, longitude, ...spotProps } = spot;
    const newSpot: spotWithLocation = {
      ...spotProps,
      inRange: false,
      distance: 0
    };
    if (location.latitude && location.longitude) {
      const distance = distanceBetweenTwoLocations(
        location.latitude,
        location.longitude,
        Number(spot.latitude),
        Number(spot.longitude),
        'M'
      );
      newSpot.distance = options.hideDistance
        ? Math.max(LOCATION_CONSTANTS.MIN_DISTANCE, distance)
        : distance;
      newSpot.inRange =
        newSpot.distance <= LOCATION_CONSTANTS.IN_RANGE_DISTANCE;
    }
    return newSpot;
  });
  return newSpots;
};

// Get the distance between two different latlng locations
const distanceBetweenTwoLocations = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'M' | 'K' | 'N'
): number => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
};

// Return a string, naming the locaton given
const getGeolocation = async (location: LocationData): Promise<string> => {
  // In order the most preferred location type
  // Nothing with a proper address
  const typeRanks = [
    'point_of_interest',
    'landmark',
    'establishment',
    'premise',
    'transit_station',
    'university',
    'neighborhood',
    'locality',
    'country'
  ];

  // for testing purposes
  if (config.useTestLocation) {
    return new Promise((resolve, reject) => {
      resolve('TEST');
    });
  }

  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
  const latlng = `latlng=${location.latitude},${location.longitude}`;
  let filter = '&result_type=';
  typeRanks.forEach((type: string, index: number) => {
    filter += type;
    if (index !== typeRanks.length - 1) {
      filter += '|';
    }
  });
  const key = `&key=${googleconfig.APIKey}`;
  const url = baseUrl + latlng + filter + key;

  return new Promise(async (resolve, reject) => {
    // check redis cache first
    const results = await redisClient.geoSearchWith(
      'geocodes',
      { latitude: location.latitude, longitude: location.longitude },
      { radius: 25, unit: 'm' },
      [GeoReplyWith.DISTANCE, GeoReplyWith.COORDINATES],
      { SORT: 'ASC' }
    );

    if (results.length > 0) {
      // check if the entry needs to be removed from cache due to time expires
      const locationName = results[0].member;
      const expiresTimestamp = await redisClient.zScore(
        'geocodes_expires',
        locationName
      );
      // remove if expired
      if (expiresTimestamp && expiresTimestamp >= new Date().getTime()) {
        await redisClient.zRem('geocodes_expires', locationName);
        await redisClient.zRem('geocodes', locationName);
      } else {
        return resolve(locationName);
      }
    }

    axios
      .get(url)
      .then((response) => {
        const res = JSON.parse(response.data);
        // No place
        if (res.results.length === 0) {
          return resolve('');
        }

        // expire time of the address
        const date = new Date();
        const geocodeExpiresIn = 7; // days
        date.setDate(date.getDate() + geocodeExpiresIn);
        const expireTimestamp = date.getTime();

        // possible address
        const possibleAddresses: any[] = [];
        res.results.forEach((place: any) => {
          place.address_components.forEach((address: any) => {
            typeRanks.forEach((typeAddress: string) => {
              if (address.types.includes(typeAddress)) {
                possibleAddresses.push([address.long_name, typeAddress]);
              }
            });
          });
        });

        // take the first highest of possible
        typeRanks.forEach((typeAddress: string) => {
          possibleAddresses.forEach((possible: any) => {
            if (possible[1] === typeAddress) {
              // add to redis and resolve
              redisClient.zAdd('geocodes_expires', [
                expireTimestamp,
                possible[0]
              ]);
              redisClient.geoAdd('geocodes', {
                member: possible[0],
                longitude: location.longitude,
                latitude: location.latitude
              });
              return resolve(possible[0]);
            }
          });
        });

        // nothing
        return resolve('');
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

export default {
  checkLocation,
  distanceBetweenTwoLocations,
  getGeolocation,
  addLocationPropsToSpots
};
