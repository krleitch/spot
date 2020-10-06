import { Account, Location, AccountMetadata } from '@models/accounts';
import { SpotError } from '@exceptions/error';

export interface State {
    account: Account;
    accountLoading: boolean;
    accountMetadata: AccountMetadata;
    authenticationError: SpotError; // Error for signup / login
    usernameError: SpotError; // Error when chaning or updating username
    usernameSuccess: boolean; // Successfully changed username
    location: Location;
    loadingLocation: boolean;
    facebookConnected: boolean;
    googleConnected: boolean;
}

export const initialState: State = (
  {
    account: null,
    accountLoading: false,
    accountMetadata: null,
    authenticationError: null,
    usernameError: null,
    usernameSuccess: false,
    facebookConnected: false,
    googleConnected: false,
    loadingLocation: false,
    location: null,
  }
);
