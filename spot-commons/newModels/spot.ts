
export enum SpotRatingType {
    NONE = "NONE",
    LIKE = "LIKE",
    DISLIKE = "DISLIKE"
}

export interface Spot {
    spotId: string;
    owner: string;
    createdAt: Date;
    deletedAt: Date;
    longitude: number;
    latitude: number;
    distance?: number;
    inRange: boolean;
    geolocation: string;
    content: string;
    imageSrc: string;
    imageNsfw: boolean;
    likes: number;
    dislikes: number;
    rated: number;
    totalComments: number;
    owned: boolean;
    link: string;
    startCommentLink?: string; // The comment link to make first request from
}
