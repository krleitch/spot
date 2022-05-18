import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { State } from './state';

// Models
import { SpotError } from '@exceptions/error';
import { User } from '@models/user';
import { LocationData } from '@models/location';
import { UserMetadata } from '@models/userMetadata';

// Store selectors
const selectUserFromStore = (state: State): User => state.user;
const selectUserLoadingFromStore = (state: State): boolean => state.userLoading;
const selectUserMetadataFromStore = (state: State): UserMetadata =>
  state.userMetadata;
const selectUserMetadataLoadingFromStore = (state: State): boolean =>
  state.userMetadataLoading;
const selectLocationLoadingFromStore = (state: State): boolean =>
  state.locationLoading;
const selectLocationFromStore = (state: State): LocationData => state.location;
const selectLocationFailureFromStore = (state: State): string =>
  state.locationFailure;
const selectLocationCreatedAtFromStore = (state: State): Date =>
  state.locationCreatedAt;
const selectFacebookConnectedFromStore = (state: State): boolean =>
  state.user && state.user.facebookId == null ? false : true;
const selectGoogleConnectedFromStore = (state: State): boolean =>
  state.user && state.user.googleId == null ? false : true;
const selectIsAuthenticatedFromStore = (state: State): boolean =>
  state.user ? true : false;
const selectIsVerifiedFromStore = (state: State): boolean =>
  state.user ? (state.user.verifiedAt ? true : false) : false;
const selectUsersState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('user');

// Export selectors
export const selectUser: MemoizedSelector<object, User> = createSelector(
  selectUsersState,
  selectUserFromStore
);
export const selectLocation: MemoizedSelector<object, LocationData> =
  createSelector(selectUsersState, selectLocationFromStore);
export const selectLocationFailure: MemoizedSelector<object, string> =
  createSelector(selectUsersState, selectLocationFailureFromStore);
export const selectLocationCreatedAt: MemoizedSelector<object, Date> =
  createSelector(selectUsersState, selectLocationCreatedAtFromStore);
export const selectLocationLoading: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectLocationLoadingFromStore);
export const selectFacebookConnected: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectFacebookConnectedFromStore);
export const selectGoogleConnected: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectGoogleConnectedFromStore);
export const selectIsAuthenticated: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectIsAuthenticatedFromStore);
export const selectIsVerified: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectIsVerifiedFromStore);
export const selectUserMetadata: MemoizedSelector<object, UserMetadata> =
  createSelector(selectUsersState, selectUserMetadataFromStore);
export const selectUserMetadataLoading: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectUserMetadataLoadingFromStore);
export const selectUserLoading: MemoizedSelector<object, boolean> =
  createSelector(selectUsersState, selectUserLoadingFromStore);
