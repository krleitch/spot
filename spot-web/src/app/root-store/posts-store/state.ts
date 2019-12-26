
export interface State {
  posts: any[];
  isLoading?: boolean;
  error?: any;
}

export const initialState: State = (
  {
    posts: null,
    isLoading: false,
    error: null
  }
);
