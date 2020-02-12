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
    owned: boolean;
}

// Load posts
export interface LoadPostRequest {
    offset: number;
    limit: number;
}

export interface LoadPostSuccess {
    posts: Post[];
    offset: number,
}

export interface LoadSinglePostRequest {
    postId: string;
}

export interface LoadSinglePostSuccess {
    post: Post;
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
