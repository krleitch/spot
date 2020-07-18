
export interface State {
    comments: any;
    replies: any;
    commentsLeft: number;
    repliesLeft: number;
    loadingCommentsBefore: { loading: boolean, id: string }; // the post id
    loadingCommentsAfter: { loading: boolean, id: string }; // the post id
}

export const initialState: State = (
  {
    loadingCommentsBefore: { loading: false, id: null },
    loadingCommentsAfter: { loading: false, id: null },
    comments: {},
    replies: {},
    commentsLeft: 0,
    repliesLeft: 0
  }
);
