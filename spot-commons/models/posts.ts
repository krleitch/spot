export interface Post {
    id: string;
    creation_date: string;
    longitude: number;
    latitude: number;
    content: string;
    likes: number;
    dislikes: number;
    rated: number;
}

// Add a post
export interface AddPostRequest {
    content: string;
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
