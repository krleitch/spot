import { Comment } from '@models/comments';

// The id on all is the post id

export interface StoreComment {
  comments: Comment[]; // the comments
  totalCommentsBefore: number;
  totalCommentsAfter: number;
}

export interface StoreReply {
  replies: Comment[]; // the comments
  tagged: boolean; // was the user tagged in this replies chain at any point
  // to check if tagged in comment, we use the tag object on the comment itself
  // so everywhere that uses this tagged should also check if also tagged in original comment
  totalRepliesAfter: number;
}

export interface State {
    comments: {
      [postId: string]: StoreComment,
    };
    replies: {
      [postId: string]: {
          [commentId: string]: StoreReply,
      };
    };
}

export const initialState: State = (
  {
    comments: {},
    replies: {},
  }
);
