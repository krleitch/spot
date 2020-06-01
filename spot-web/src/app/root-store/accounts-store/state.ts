import { Account, Location } from '@models/accounts';

export interface State {
    account: Account;
    location: Location;
    loadingLocation: boolean;
    facebookConnected: boolean;
}

export const initialState: State = (
  {
    facebookConnected: false,
    account: null,
    location: null,
    loadingLocation: false
  }
);
