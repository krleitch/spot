
export interface State {
    loggedIn: boolean;
    idToken: string;
    user: any;
    expireIn: string;
    error: string;
}

export const initialState: State = (
  {
    loggedIn: false,
    idToken: null,
    user: null,
    expireIn: null,
    error: null
  }
);
