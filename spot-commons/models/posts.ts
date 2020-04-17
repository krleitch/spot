import { Location } from './accounts';

export interface Post {
    id: string;
    creation_date: string;
    longitude: number;
    latitude: number;
    content: string;
    image_src: string;
    likes: number;
    dislikes: number;
    rated: number;
    comments: number;
    owned: boolean;
    link: string;
}

export interface PostFilter {
    location: string; // global, local
    sort: string; // new, hot
}

// Load posts
export interface LoadPostRequest {
    offset: number;
    limit: number;
    location: Location;
    filter: PostFilter;
}

export interface LoadPostSuccess {
    posts: Post[];
    offset: number,
}

export interface LoadSinglePostRequest {
    postLink: string;
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
    offset: number;
    limit: number;
}

export interface ActivityPostSuccess {
    activity: Post[];
}
