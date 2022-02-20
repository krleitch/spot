
export enum UnitSystem {
  IMPERIAL = "IMPERIAL",
  METRIC = "METRIC"
}

export enum LocationType {
  GLOBAL = "GLOBAL",
  LOCAL = "LOCAL"
}

export enum SearchType {
  HOT = "HOT",
  NEW = "NEW",
}

export enum ThemeWeb {
  LIGHT = "LIGHT",
  DARK = "DARK"
}

export interface UserMetadata {
  unitSystem: UnitSystem,
  locationType: LocationType,
  searchType: SearchType,
  themeWeb: ThemeWeb,
  matureFilter: boolean,
  score: number
}

// Get
export interface GetUserMetadataRequest {}
export interface GetUserMetadataResponse {
    metadata: UserMetadata;
}

// Update
export interface UpdateUserMetadataRequest {
    unitSystem?: UnitSystem;
    searchType?: SearchType;
    locationType?: LocationType;
    matureFilter?: boolean;
    themeWeb?: ThemeWeb;
}

export interface UpdateUserMetadataResponse {
    metadata: UserMetadata;
}