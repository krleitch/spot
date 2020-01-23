export interface Post {
    id: string;
    creation_date: string;
    longitude: number;
    latitude: number;
    content: string;
    likes: number;
    dislikes: number;
    rated: number;
    comments: number;
}

// Load posts
export interface LoadPostSuccess {
    posts: Post[];
}

// Add a post
export interface AddPostRequest {
    content: string;
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
