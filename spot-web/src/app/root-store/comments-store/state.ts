import { SpotError } from '@exceptions/error';
import { Comment } from '@models/comments';

// The id on all is the post id

export interface StoreComment {
  comments: Comment[]; // the comment
  tagged: boolean; // was the user tagged in this comment chain?
}

export interface StoreReply {
  replies: Comment[]; // the comment
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
