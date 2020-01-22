import { Post } from '@models/posts';

export interface State {
  posts: Post[];
}

export const initialState: State = (
  {
    posts: [],
  }
);
