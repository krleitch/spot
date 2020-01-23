export interface Comment {
    id: string;
    post_id: string;
    creation_date: string;
    content: string;
    likes: number;
    dislikes: number;
    rated: number;
}

// Load all comments
export interface LoadCommentsRequest {
    postId: string;
}

export interface LoadCommentsSuccess {
    comments: Comment[];
}

// Add a comment
export interface AddCommentRequest {
    postId: string;
    content: string;
}

export interface AddCommentSuccess {
    comment: Comment;
}






export interface CommentsHash {
    [post_id: string] : Comment[];
}

