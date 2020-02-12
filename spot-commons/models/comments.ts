export interface Comment {
    id: string;
    post_id: string;
    parent_id: string;
    creation_date: string;
    content: string;
    likes: number;
    dislikes: number;
    rated: number;
    profilePicture: number;
}

// Load all comments
export interface LoadCommentsRequest {
    postId: string;
    offset: number;
    limit: number;
}

export interface LoadCommentsSuccess {
    postId: string;
    totalComments: number;
    comments: Comment[];
    offset: number;
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

// Load all replies
export interface LoadRepliesRequest {
    postId: string;
    commentId: string;
    offset: number;
    limit: number;
}

export interface LoadRepliesSuccess {
    postId: string;
    commentId: string;
    replies: Comment[];
    totalReplies: number;
    offset: number;
}

// Add a reply
export interface AddReplyRequest {
    postId: string;
    commentId: string;
    content: string;
}

export interface AddReplySuccess {
    postId: string;
    commentId: string;
    reply: Comment;
}

// Delete a comment
export interface DeleteReplyRequest {
    postId: string;
    parentId: string;
    commentId: string;
}

export interface DeleteReplySuccess {
    postId: string;
    parentId: string;
    commentId: string;
}

// Like a comment
export interface LikeCommentRequest {
    postId: string;
    commentId: string;
}

export interface LikeCommentSuccess {
    postId: string;
    commentId: string;
}

// Dislike a comment
export interface DislikeCommentRequest {
    postId: string;
    commentId: string;
}

export interface DislikeCommentSuccess {
    postId: string;
    commentId: string;
}

// Like a reply
export interface LikeReplyRequest {
    postId: string;
    parentId: string;
    commentId: string;
}

export interface LikeReplySuccess {
    postId: string;
    parentId: string;
    commentId: string;
}

// Dislike a reply
export interface DislikeReplyRequest {
    postId: string;
    parentId: string;
    commentId: string;
}

export interface DislikeReplySuccess {
    postId: string;
    parentId: string;
    commentId: string;
}

// Hash used for storing comments in ngrx
export interface CommentsHash {
    [post_id: string] : Comment[];
}

export interface RepliesHash {
    [post_id: string] : { [comment_id: string] : Comment[]; };
}

