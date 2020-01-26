
export interface State {
    comments: any;
    replies: any;
    commentsLeft: number;
    repliesLeft: number;
}

export const initialState: State = (
  {
    comments: {},
    replies: {},
    commentsLeft: 0,
    repliesLeft: 0
  }
);
