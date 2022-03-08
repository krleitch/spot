import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { State } from './state';

// Assets
import { SpotError } from '@exceptions/error';
import { User } from '@models/user';
import { LocationData } from '@models/location';
import { UserMetadata } from '@models/userMetadata';

export const selectUserFromStore = (state: State): User => state.user;
export const selectUserLoadingFromStore = (state: State): boolean =>
  state.userLoading;
export const selectUserMetadataFromStore = (state: State): UserMetadata =>
  state.userMetadata;
export const selectLoadingLocationFromStore = (state: State): boolean =>
  state.loadingLocation;
export const selectLocationFromStore = (state: State): LocationData =>
  state.location;
export const selectLocationFailureFromStore = (state: State): string =>
  state.locationFailure;
export const selectLocationTimeReceivedFromStore = (state: State): Date =>
  state.locationTimeReceived;
export const selectFacebookConnectedFromStore = (state: State): boolean =>
  state.user && state.user.facebookId == null ? false : true;
export const selectGoogleConnectedFromStore = (state: State): boolean =>
  state.user && state.user.googleId == null ? false : true;
export const selectAuthenticationErrorFromStore = (state: State): SpotError =>
  state.authenticationError;
export const selectAuthenticationSuccessFromStore = (state: State): boolean =>
  state.authenticationSuccess;
export const selectIsAuthenticatedFromStore = (state: State): boolean =>
  state.user ? true : false;
export const selectIsVerifiedFromStore = (state: State): boolean =>
  state.user ? (state.user.verifiedAt ? true : false) : false;

export const selectUsersState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('user');

export const selectUser: MemoizedSelector<object, User> = createSelector(
  selectUsersState,
  selectUserFromStore
);

export const selectLocation: MemoizedSelector<object, LocationData> =
  createSelector(selectUsersState, selectLocationFromStore);

export const selectLocationFailure: MemoizedSelector<object, string> =
  createSelector(selectUsersState, selectLocationFailureFromStore);

export const selectLocationTimeReceived: MemoizedSelector<object, Date> =
  createSelector(selectUsersState, selectLocationTimeReceivedFromStore);

export const selectLoadingLocation: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectLoadingLocationFromStore);

export const selectFacebookConnected: MemoizedSelector<object, any> =
  createSelector(selectUsersState, selectFacebookConnectedFromStore);

export const selectGoogleConnected: MemoizedSelector<object, any> =
  createSelector(selectUsersState, selectGoogleConnectedFromStore);

export const selectAuthenticationError: MemoizedSelector<object, SpotError> =
  createSelector(selectUsersState, selectAuthenticationErrorFromStore);

export const selectAuthenticationSuccess: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectAuthenticationSuccessFromStore);

export const selectIsAuthenticated: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectIsAuthenticatedFromStore);

export const selectIsVerified: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectIsVerifiedFromStore);

export const selectUserMetadata: MemoizedSelector<object, UserMetadata> =
  createSelector(selectUsersState, selectUserMetadataFromStore);

export const selectUserLoading: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectUserLoadingFromStore);
