import { Post } from '@models/posts';
import { SpotError } from '@exceptions/error';

export interface State {
  posts: Post[];
  loading: boolean;
  createError: SpotError;
  createSuccess: boolean;
}

export const initialState: State = (
  {
    posts: [],
    loading: false,
    createError: null,
    createSuccess: false
  }
);
