import P from '@prisma/client';

import DBClient from './DBClient.js';
const prisma = DBClient.instance;

import {
  UserMetadata,
  UnitSystem,
  LocationType,
  SearchType,
  ThemeWeb
} from '@models/../newModels/userMetadata.js';

// Creating and Finding and deleting metadata should be done in user.ts

// The properties that exist on the @model userMetadata
const selectModelUserMetadata =
  P.Prisma.validator<P.Prisma.UserMetadataSelect>()({
    unitSystem: true,
    locationType: true,
    searchType: true,
    themeWeb: true,
    score: true,
    matureFilter: true
  });

// Change the prisma enum to the model enum
const mapToModelEnum = <T>(
  metadataWithProps: T & {
    unitSystem: P.UnitSystem;
    locationType: P.LocationType;
    searchType: P.SearchType;
    themeWeb: P.ThemeWeb;
  }
): T & {
  unitSystem: UnitSystem;
  locationType: LocationType;
  searchType: SearchType;
  themeWeb: ThemeWeb;
} => {
  return {
    ...metadataWithProps,
    unitSystem: UnitSystem[metadataWithProps.unitSystem],
    locationType: LocationType[metadataWithProps.locationType],
    searchType: SearchType[metadataWithProps.searchType],
    themeWeb: ThemeWeb[metadataWithProps.themeWeb],
  };
};

const updateUserMetadataUnitSystem = async (
  userId: string,
  unitSystem: UnitSystem
): Promise<UserMetadata> => {
  let updatedMetadata = await prisma.userMetadata.update({
    where: {
      userId: userId
    },
    data: {
      unitSystem: unitSystem
    },
    select: selectModelUserMetadata
  });
  // Map the schema enum to the user enum
  return mapToModelEnum(updatedMetadata);
};

const updateUserMetadataSearchType = async (
  userId: string,
  searchType: SearchType
): Promise<UserMetadata> => {
  let updatedMetadata = await prisma.userMetadata.update({
    where: {
      userId: userId
    },
    data: {
      searchType: searchType
    },
    select: selectModelUserMetadata
  });
  // Map the schema enum to the user enum
  return mapToModelEnum(updatedMetadata);
};

const updateUserMetadataLocationType = async (
  userId: string,
  locationType: LocationType
): Promise<UserMetadata> => {
  let updatedMetadata = await prisma.userMetadata.update({
    where: {
      userId: userId
    },
    data: {
      locationType: locationType
    },
    select: selectModelUserMetadata
  });
  // Map the schema enum to the user enum
  return mapToModelEnum(updatedMetadata);
};

const updateUserMetadataMatureFilter = async (
  userId: string,
  matureFilter: boolean
): Promise<UserMetadata> => {
  let updatedMetadata = await prisma.userMetadata.update({
    where: {
      userId: userId
    },
    data: {
      matureFilter: matureFilter
    },
    select: selectModelUserMetadata
  });
  // Map the schema enum to the user enum
  return mapToModelEnum(updatedMetadata);
};
const updateUserMetadataThemeWeb = async (
  userId: string,
  themeWeb: ThemeWeb
): Promise<UserMetadata> => {
  let updatedMetadata = await prisma.userMetadata.update({
    where: {
      userId: userId
    },
    data: {
      themeWeb: themeWeb
    },
    select: selectModelUserMetadata
  });
  // Map the schema enum to the user enum
  return mapToModelEnum(updatedMetadata);
};

export default {
  updateUserMetadataUnitSystem,
  updateUserMetadataSearchType,
  updateUserMetadataLocationType,
  updateUserMetadataMatureFilter,
  updateUserMetadataThemeWeb
};
