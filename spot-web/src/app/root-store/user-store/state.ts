import { User } from '@models/user';
import { LocationData } from '@models/location';
import { UserMetadata } from '@models/userMetadata';
import { SpotError } from '@exceptions/error';

export interface State {
  // USER
  user: User;
  userLoading: boolean;
  userMetadata: UserMetadata;
  userMetadataLoading: boolean;

  // AUTH
  authenticationError: SpotError;

  // LOCATION
  locationLoading: boolean;
  locationFailure: string;
  location: LocationData;
  locationCreatedAt: Date;
}

export const initialState: State = {
  user: null,
  userLoading: false,
  userMetadata: null,
  userMetadataLoading: false,

  authenticationError: null,

  locationLoading: false,
  locationFailure: null,
  location: null,
  locationCreatedAt: null
};
