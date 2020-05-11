
export interface State {
    comments: any;
    replies: any;
    commentsLeft: number;
    repliesLeft: number;
    loadingCommentsBefore: boolean;
    loadingCommentsAfter: boolean;
}

export const initialState: State = (
  {
    loadingCommentsBefore: false,
    loadingCommentsAfter: false,
    comments: {},
    replies: {},
    commentsLeft: 0,
    repliesLeft: 0
  }
);
