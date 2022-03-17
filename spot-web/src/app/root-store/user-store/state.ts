import { User } from '@models/user';
import { LocationData } from '@models/location';
import { UserMetadata } from '@models/userMetadata';
import { SpotError } from '@exceptions/error';

export interface State {
  user: User;
  userLoading: boolean;
  userMetadata: UserMetadata;
  userMetadataLoading: boolean;
  authenticationError: SpotError;
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
