import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

import { SpotError } from '@exceptions/error';
import { AccountMetadata, Account, Location } from '@models/accounts';

export const selectAccountFromStore = (state: State): Account => state.account;
export const selectAccountLoadingFromStore = (state: State): boolean => state.accountLoading;
export const selectAccountMetadataFromStore = (state: State): AccountMetadata => state.accountMetadata;
export const selectLoadingLocationFromStore = (state: State): boolean => state.loadingLocation;
export const selectLocationFromStore = (state: State): Location => state.location;
export const selectLocationFailureFromStore = (state: State): string => state.locationFailure;
export const selectFacebookConnectedFromStore = (state: State): boolean => state.facebookConnected;
export const selectGoogleConnectedFromStore = (state: State): boolean => state.googleConnected;
export const selectAuthenticationErrorFromStore = (state: State): SpotError => state.authenticationError;
export const selectIsAuthenticatedFromStore = (state: State): boolean => state.account ? true : false;
export const selectIsVerifiedFromStore = (state: State): boolean => state.account.verified_date ? true : false;

export const selectAccountsState: MemoizedSelector<object, State> = createFeatureSelector<State>('accounts');

export const selectAccount: MemoizedSelector<object, Account> = createSelector(
  selectAccountsState,
  selectAccountFromStore,
);

export const selectLocation: MemoizedSelector<object, Location> = createSelector(
  selectAccountsState,
  selectLocationFromStore,
);

export const selectLocationFailure: MemoizedSelector<object, string> = createSelector(
  selectAccountsState,
  selectLocationFailureFromStore,
);

export const selectLoadingLocation: MemoizedSelector<object, boolean> = createSelector(
  selectAccountsState,
  selectLoadingLocationFromStore,
);

export const selectFacebookConnected: MemoizedSelector<object, any> = createSelector(
  selectAccountsState,
  selectFacebookConnectedFromStore,
);

export const selectGoogleConnected: MemoizedSelector<object, any> = createSelector(
  selectAccountsState,
  selectGoogleConnectedFromStore,
);

export const selectAuthenticationError: MemoizedSelector<object, SpotError> = createSelector(
  selectAccountsState,
  selectAuthenticationErrorFromStore,
);

export const selectIsAuthenticated: MemoizedSelector<object, boolean> = createSelector(
  selectAccountsState,
  selectIsAuthenticatedFromStore,
);

export const selectIsVerified: MemoizedSelector<object, boolean> = createSelector(
  selectAccountsState,
  selectIsVerifiedFromStore,
);

export const selectAccountMetadata: MemoizedSelector<object, AccountMetadata> = createSelector(
  selectAccountsState,
  selectAccountMetadataFromStore,
);

export const selectAccountLoading: MemoizedSelector<object, boolean> = createSelector(
  selectAccountsState,
  selectAccountLoadingFromStore,
);
