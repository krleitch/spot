import { SpotError } from '@exceptions/error';
import { Comment } from '@models/comments';

// The id on all is the post id

export interface StoreComment {
  comments: Comment[]; // the comments
  tagged: boolean; // was the user tagged in this comment chain?
}

export interface StoreReply {
  replies: Comment[]; // the comments
}

export interface State {
    comments: { [postId: string]: StoreComment };
    replies: { [postId: string]: { [commentId: string]: StoreReply } };
}

export const initialState: State = (
  {
    comments: {},
    replies: {},
  }
);
