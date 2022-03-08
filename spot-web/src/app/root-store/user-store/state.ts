import { User } from '@models/user';
import { LocationData } from '@models/location';
import { UserMetadata } from '@models/userMetadata';
import { SpotError } from '@exceptions/error';

export interface State {
  user: User;
  userLoading: boolean;
  userMetadata: UserMetadata;
  authenticationSuccess: boolean;
  authenticationError: SpotError; // Error for signup / login
  usernameError: SpotError; // Error when chaning or updating username
  usernameSuccess: boolean; // Successfully changed username
  location: LocationData;
  locationFailure: string;
  locationTimeReceived: Date;
  loadingLocation: boolean;
}

export const initialState: State = {
  user: null,
  userLoading: false,
  userMetadata: null,
  authenticationSuccess: null,
  authenticationError: null,
  usernameError: null,
  usernameSuccess: false,
  loadingLocation: false,
  locationFailure: null,
  location: null,
  locationTimeReceived: null
};
