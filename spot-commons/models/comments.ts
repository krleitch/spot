import { Tag } from './notifications';
import { Location } from './accounts';
import { ReportCategory } from './report';
export interface Comment {
    id: string;
    post_id: string;
    parent_id: string;
    comment_parent_id: string;
    creation_date: string;
    content: string;
    image_src: string;
    image_nsfw: boolean;
    likes: number;
    dislikes: number;
    rated: number;
    link: string;
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
    commentLink?: string; // Will load starting from this comment
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
    comments: Comment[];
    type: string; // before / after
    initialLoad: boolean;
    totalCommentsBefore?: number;
    totalCommentsAfter?: number;
}

// Add a comment
export interface AddCommentRequest {
    postId: string;
    content: string;
    image: File;
    tagsList: Tag[];
    location: Location;
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
export interface GetRepliesRequest {
    postId: string;
    commentId: string;
    replyLink?: string; // Will load up to this reply
    date: string;
    limit: number;
    initialLoad: boolean;
}

export interface GetRepliesSuccess {
    postId: string;
    commentId: string;
    replies: Comment[];
    totalRepliesAfter: number;
    date: string;
    initialLoad: boolean;
}

export interface SetRepliesStoreRequest {
    postId: string;
    commentId: string;
    replies: Comment[];
    date: string;
    initialLoad: boolean;
    totalRepliesAfter: number;
}

// Add a reply
export interface AddReplyRequest {
    postId: string;
    commentId: string;
    commentParentId: string; // the comment the user added the reply on. it would stil have same parent
    content: string;
    image: File;
    tagsList: Tag[];
    location: Location;
}

export interface AddReplySuccess {
    postId: string;
    commentId: string;
    reply: Comment;
}

export interface AddReplyStoreRequest {
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

// Unrated a comment
export interface UnratedCommentRequest {
    postId: string;
    commentId: string;
}

export interface UnratedCommentSuccess {
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

// Unrated a reply
export interface UnratedReplyRequest {
    postId: string;
    parentId: string;
    commentId: string;
}

export interface UnratedReplySuccess {
    postId: string;
    parentId: string;
    commentId: string;
}

// report
export interface ReportCommentRequest {
    postId: string;
    commentId: string;
    content: string;
    category: ReportCategory;
}

export interface ReportCommentSuccess {

}

// activity
export interface ActivityCommentRequest {
    limit: number;
    before?: string;
    after?: string;
}

export interface CommentActivity {
    id: string;
    creation_date: string;
    likes: number;
    dislikes: number;
    content: string;
    image_src: string;
    image_nsfw: boolean;
    parent_id: string;
    link: string;
    post_content: string;
    post_image_src: string;
    post_image_nsfw: boolean;
    post_link: string;
    parent_content: string;
    parent_image_src: string;
    parent_image_nsfw: boolean;
    parent_link: string;
    tag: CommentTag;
}

export interface ActivityCommentSuccess {
    size: number;
    activity: CommentActivity[];
    cursor: {
        before: string;
        after: string;
    }
}

// Hash used for storing comments in ngrx
export interface CommentsHash {
    [post_id: string] : Comment[];
}

export interface RepliesHash {
    [post_id: string] : { [comment_id: string] : Comment[]; };
}

