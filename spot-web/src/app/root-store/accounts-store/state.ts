import { Account, Location, AccountMetadata } from '@models/accounts';
import { SpotError } from '@exceptions/error';

export interface State {
    account: Account;
    accountMetadata: AccountMetadata;
    authenticationError: SpotError; // Error for signup / login
    usernameError: SpotError; // Error when chaning or updating username
    location: Location;
    loadingLocation: boolean;
    facebookConnected: boolean;
}

export const initialState: State = (
  {
    account: null,
    accountMetadata: null,
    authenticationError: null,
    usernameError: null,
    facebookConnected: false,
    loadingLocation: false,
    location: null,
  }
);
