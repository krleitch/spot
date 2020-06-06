import { Account, Location } from '@models/accounts';
import { SpotError } from '@exceptions/error';

export interface State {
    account: Account;
    authError: SpotError;
    location: Location;
    loadingLocation: boolean;
    facebookConnected: boolean;
}

export const initialState: State = (
  {
    account: null,
    authError: null,
    facebookConnected: false,
    loadingLocation: false,
    location: null,
  }
);
