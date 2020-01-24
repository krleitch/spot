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
    offset: number;
    limit: number;
}

export interface LoadCommentsSuccess {
    postId: string;
    comments: Comment[];
}

// Add a comment
export interface AddCommentRequest {
    postId: string;
    content: string;
}

export interface AddCommentSuccess {
    postId: string;
    comment: Comment;
}

// Delete a comment
export interface DeleteCommentRequest {
    postId: string;
    commentId: string;
}

export interface DeleteCommentSuccess {
    postId: string;
    commentId: string;
}

export interface CommentsHash {
    [post_id: string] : Comment[];
}

