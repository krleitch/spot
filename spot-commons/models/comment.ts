import { ReportCategory } from "./report";
import { LocationData } from "./location";

export enum CommentRatingType {
  NONE = "NONE",
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

export interface Tag {
  offset: number;
  username?: string;
}
export interface CommentTag {
  tagged: boolean; // were you tagged
  taggedBy: string; // the username of the tagger, only if you were tagged, otherwise ''
  tags: Tag[];
}
export interface Comment {
  commentId: string;
  spotId: string;
  parentCommentId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  content: string;
  imageSrc: string | null;
  imageNsfw: boolean | null;
  likes: number;
  dislikes: number;
  myRating: CommentRatingType;
  link: string;
  owned: boolean;
  profilePictureNum: number; // The enumeration of the image (colour)
  profilePictureSrc: string; // The image
  tag: CommentTag;
}

// Get Comments
export interface GetCommentsRequest {
  spotId: string;
  commentLink?: string; // Will load starting from this comment
  limit: number;
  before?: string;
  after?: string;
}
export interface GetCommentsResponse {
  comments: Comment[];
  totalCommentsBefore: number; // Should we show load more
  totalCommentsAfter: number; // Should we show load recent
  cursor: {
    before: string | undefined;
    after: string | undefined;
  };
}
export interface SetCommentsStoreRequest {
  spotId: string;
  comments: Comment[];
  type: 'before' | 'after' | 'initial'; // Where to insert
  totalCommentsBefore?: number;
  totalCommentsAfter?: number;
}
export interface ClearCommentsRequest {
  spotId: string;
}

// Add a comment
export interface CreateCommentRequest {
  spotId: string;
  content: string;
  image: File;
  tagsList: Tag[];
  location: LocationData;
}
export interface CreateCommentResponse {
  comment: Comment;
}
export interface AddCommentStoreRequest {
  comment: Comment;
}

// Delete a comment
export interface DeleteCommentRequest {
  spotId: string;
  commentId: string;
}
export interface DeleteCommentResponse {}

// Get all replies
export interface GetRepliesRequest {
  spotId: string;
  commentId: string;
  replyLink?: string; // Will load up to this reply
  before?: string;
  after?: string;
  limit: number;
}
export interface GetRepliesResponse {
  replies: Comment[];
  totalRepliesAfter: number;
  cursor: {
    before: string | undefined;
    after: string | undefined;
  };
}
export interface SetRepliesStoreRequest {
  spotId: string;
  commentId: string;
  replies: Comment[];
  type: 'after' | 'initial'; // before not implemented yet
  totalRepliesAfter: number;
}

// Create a reply
export interface CreateReplyRequest {
  spotId: string;
  commentId: string;
  commentParentId: string; // the comment the user added the reply on. it would stil have same parent
  content: string;
  image: File;
  tagsList: Tag[];
  location: LocationData;
}
export interface CreateReplyResponse {
  reply: Comment;
}
export interface AddReplyStoreRequest {
  reply: Comment;
}

// Delete a reply
export interface DeleteReplyRequest {
  spotId: string;
  commentId: string;
  replyId: string;
}
export interface DeleteReplyResponse {}

// Rate a comment
export interface RateCommentRequest {
  spotId: string;
  commentId: string;
  rating: CommentRatingType;
}
export interface RateCommentResponse {}

// Rate a reply
export interface RateReplyRequest {
  spotId: string;
  commentId: string;
  replyId: string;
  rating: CommentRatingType
}
export interface RateReplyResponse {}

// Report
export interface ReportCommentRequest {
  spotId: string;
  commentId: string;
  content: string;
  category: ReportCategory;
}
export interface ReportCommentResponse {}

// Activity
export interface CommentActivity {
  commentId: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  content: string;
  imageSrc: string | null;
  imageNsfw: boolean | null;
  link: string;
  spotImageSrc: string | null;
  spotImageNsfw: boolean | null;
  spotLink: string;
  parentCommentId: string | null;
  parentCommentImageSrc: string | null;
  parentCommentImageNsfw: boolean| null;
  parentCommentLink: string| null;
  tag: CommentTag;
}
export interface GetCommentActivityRequest {
  limit: number;
  before?: string;
  after?: string;
}
export interface GetCommentActivityResponse {
  activity: CommentActivity[];
  cursor: {
    before?: string;
    after?: string;
  };
}

// Hash used for storing comments in ngrx
export interface CommentsHash {
  [spotId: string]: Comment[];
}
export interface RepliesHash {
  [spotId: string]: { [commentId: string]: Comment[] };
}
