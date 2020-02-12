import { Account, Location } from '@models/accounts';

export interface State {
    account: Account;
    location: Location;
}

export const initialState: State = (
  {
    account: null,
    location: null
  }
);
