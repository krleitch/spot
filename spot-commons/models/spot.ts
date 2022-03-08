import { LocationType, SearchType } from './userMetadata';
import { LocationData } from './location';
import { ReportCategory } from './report';

export enum SpotRatingType {
    NONE = "NONE",
    LIKE = "LIKE",
    DISLIKE = "DISLIKE"
}

export interface Spot {
    spotId: string;
    createdAt: Date;
    deletedAt: Date | null;
    distance?: number;
    inRange: boolean;
    geolocation: string;
    content: string;
    imageSrc: string | null;
    imageNsfw: boolean | null;
    likes: number;
    dislikes: number;
    myRating: SpotRatingType;
    totalComments: number;
    link: string;
    owned: boolean;
    startCommentLink?: string; // The comment link to make first request from
}

// Get Spots, and single Spot
export interface GetSpotOptions {
    locationType: LocationType
    searchType: SearchType,
}
export interface GetSpotRequest {
    limit: number;
    initialLoad: boolean;
    location: LocationData;
    options: GetSpotOptions;
    before?: string, // id of the first spot
    after?: string, // id of the last spot
}
export interface GetSpotResponse {
    spots: Spot[];
    initialLoad: boolean,
    cursor: {
        before: string | null,
        after: string | null,
    }
}
export interface GetSingleSpotRequest {
    spotLink: string;
    location: LocationData;
}
export interface GetSingleSpotResponse {
    spot: Spot;
}
export interface SetSpotStoreRequest {
    spots: Spot[];
    initialLoad: boolean;
}

// Create
export interface CreateSpotRequest {
    content: string;
    location: LocationData;
    image: File;
}
export interface CreateSpotResponse {
    spot: Spot;
}

export interface AddSpotStoreRequest {
    spot: Spot
}

// Update spot properties
export interface RateSpotRequest {
    spotId: string;
    rating: SpotRatingType;
}

export interface RateSpotResponse {}
export interface DeleteRatingRequest {
    spotId: string;
}
export interface DeleteRatingResponse {}

// Delete a post
export interface DeleteSpotRequest {
    spotId: string;
}
export interface DeleteSpotResponse {}

// Report
export interface ReportSpotRequest {
    spotId: string;
    content: string;
    category: ReportCategory
}
export interface ReportSpotResponse {}

// Activity
export interface GetSpotActivityRequest {
    limit: number;
    location: LocationData;
    before?: Date | null;
    after?: Date | null;
}
export interface GetSpotActivityResponse {
    activity: Spot[];
    size: number;
    cursor: {
        before: Date | null;
        after: Date | null;
    }
}
