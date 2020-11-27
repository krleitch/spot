import { Location } from './accounts';

export interface Post {
    id: string;
    creation_date: string;
    longitude: number;
    latitude: number;
    distance?: number;
    inRange: boolean;
    geolocation: string;
    content: string;
    image_src: string;
    image_nsfw: boolean;
    likes: number;
    dislikes: number;
    rated: number;
    comments: number;
    owned: boolean;
    link: string;
    startCommentId?: string; // The comment Id to make first request from
}

export interface PostFilter {
    location: string; // global, local
    sort: string; // new, hot
}

// Load posts
export interface LoadPostRequest {
    offset?: number;
    limit: number;
    date?: string;
    initialLoad: boolean;
    location: Location;
    filter: PostFilter;
}

export interface LoadPostSuccess {
    posts: Post[];
    initialLoad: boolean,
}

export interface LoadSinglePostRequest {
    postLink: string;
    location: Location;
}

export interface LoadSinglePostSuccess {
    post: Post;
}

// Add a post
export interface AddPostRequest {
    content: string;
    location: Location;
    image: File;
}

export interface AddPostSuccess {
    post: Post;
}

// Like a post
export interface LikePostRequest {
    postId: string;
}

export interface LikePostSuccess {
    postId: string;
}

// Dislike a post
export interface DislikePostRequest {
    postId: string;
}

export interface DislikePostSuccess {
    postId: string;
}

// Unrated a post
export interface UnratedPostRequest {
    postId: string;
}

export interface UnratedPostSuccess {
    postId: string;
}

// Delete a post
export interface DeletePostRequest {
    postId: string;
}

export interface DeletePostSuccess {
    postId: string;
}

// report
export interface ReportPostRequest {
    postId: string;
    content: string;
}

export interface ReportPostSuccess {

}

// activity
export interface ActivityPostRequest {
    limit: number;
    location: Location;
    date: string;
}

export interface ActivityPostSuccess {
    activity: Post[];
}
