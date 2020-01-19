export interface Post {
    id: string;
    creation_date: string;
    creator: string;
    longitude: number;
    latitude: number;
    content: string;
    likes: number;
    dislikes: number;
}

export interface AddPostRequest {
    content: string;
}

export interface LikePostRequest {
    postId: string;
}

export interface DislikePostRequest {
    postId: string;
}

export interface PostRatingRequest {
    postId: string;
}

export interface PostRatingResponse {
    post_id: string;
    likes: number;
    dislikes: number;
    rated: boolean;
}
