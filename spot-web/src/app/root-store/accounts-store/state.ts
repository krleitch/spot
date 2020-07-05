import { Account, Location, AccountMetadata } from '@models/accounts';
import { SpotError } from '@exceptions/error';

export interface State {
    account: Account;
    accountMetadata: AccountMetadata;
    authError: SpotError;
    usernameError: SpotError;
    location: Location;
    loadingLocation: boolean;
    facebookConnected: boolean;
}

export const initialState: State = (
  {
    account: null,
    accountMetadata: null,
    authError: null,
    usernameError: null,
    facebookConnected: false,
    loadingLocation: false,
    location: null,
  }
);
