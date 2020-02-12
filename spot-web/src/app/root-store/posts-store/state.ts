import { Post } from '@models/posts';

export interface State {
  posts: Post[];
  loading: boolean;
}

export const initialState: State = (
  {
    posts: [],
    loading: false
  }
);
