import { Tag } from './notifications';

export interface Comment {
    id: string;
    post_id: string;
    parent_id: string;
    comment_parent_id: string;
    creation_date: string;
    content: string;
    image_src: string;
    likes: number;
    dislikes: number;
    rated: number;
    profilePicture: number; // The enumeration of the image (colour)
    profilePictureSrc: number; // The image
    owned: boolean;
    tag: CommentTag;
}

export interface CommentTag {
    owned: boolean;
    numTagged: number;
    tagged: boolean;
    tagger?: string;
    tags: any[];
}

// Load all comments
export interface GetCommentsRequest {
    postId: string;
    commentId?: string; // Will load starting from this comment
    type: string; // before / after
    date: string; // not used if commentId supplied
    limit: number;
}

export interface GetCommentsSuccess {
    postId: string;
    totalCommentsBefore: number; // Should we show load more
    totalCommentsAfter: number; // Should we show load recent
    comments: Comment[];
    type: string; // before or after
}

export interface SetCommentsStoreRequest {
    postId: string;
    commentId?: string; // Will load starting from this comment
    comments: Comment[];
    type: string; // before / after
    initialLoad: boolean;
}

// Add a comment
export interface AddCommentRequest {
    postId: string;
    content: string;
    image: File;
    tagsList: Tag[];
}

export interface AddCommentSuccess {
    postId: string;
    comment: Comment;
}

export interface AddCommentStoreRequest {
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
    date: string;
    limit: number;
    initialLoad: boolean;
}

export interface LoadRepliesSuccess {
    postId: string;
    commentId: string;
    replies: Comment[];
    totalReplies: number;
    date: string;
    initialLoad: boolean;
}

// Add a reply
export interface AddReplyRequest {
    postId: string;
    commentId: string;
    commentParentId: string; // the comment the user added the reply on. it would stil have same parent
    content: string;
    image: File;
    tagsList: Tag[];
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

// report
export interface ReportCommentRequest {
    postId: string;
    commentId: string;
    content: string;
}

export interface ReportCommentSuccess {

}

// activity
export interface ActivityCommentRequest {
    date: string;
    limit: number;
}

export interface CommentActivity {
    id: string;
    creation_date: string;
    likes: number;
    dislikes: number;
    content: string;
    image_src: string;
    parent_id: string;
    link: string;
    post_content: string;
    post_image_src: string;
    post_link: string;
    parent_content: string;
    parent_image_src: string;
    parent_link: string;
    tag: CommentTag;
}

export interface ActivityCommentSuccess {
    activity: CommentActivity[];
}

// Hash used for storing comments in ngrx
export interface CommentsHash {
    [post_id: string] : Comment[];
}

export interface RepliesHash {
    [post_id: string] : { [comment_id: string] : Comment[]; };
}

