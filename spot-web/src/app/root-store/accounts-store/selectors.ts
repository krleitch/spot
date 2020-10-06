import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { SpotError } from '@exceptions/error';
import { AccountMetadata, Account } from '@models/accounts';

import { State } from './state';

export const selectAccount = (state: State): Account => state.account;
export const selectAccountLoad = (state: State): boolean => state.accountLoading;
export const selectMetadata = (state: State): AccountMetadata => state.accountMetadata;
export const selectLoadingLocation = (state: State): boolean => state.loadingLocation;
export const selectLocation = (state: State): any => state.location;
export const selectFacebook = (state: State): boolean => state.facebookConnected;
export const selectGoogle = (state: State): boolean => state.googleConnected;
export const selectAuthErr = (state: State): SpotError => state.authenticationError;
export const selectIsAuth = (state: State): boolean => state.account ? true : false;

export const selectAccountsState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('accounts');

export const selectAccountsUser: MemoizedSelector<
  object,
  any
> = createSelector(
  selectAccountsState,
  selectAccount,
);

export const selectAccountsLocation: MemoizedSelector<
  object,
  any
> = createSelector(
  selectAccountsState,
  selectLocation,
);

export const selectAccountsLoadingLocation: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectAccountsState,
  selectLoadingLocation,
);

export const selectFacebookConnected: MemoizedSelector<
  object,
  any
> = createSelector(
  selectAccountsState,
  selectFacebook,
);

export const selectGoogleConnected: MemoizedSelector<
  object,
  any
> = createSelector(
  selectAccountsState,
  selectGoogle,
);

export const selectAuthenticationError: MemoizedSelector<
  object,
  SpotError
> = createSelector(
  selectAccountsState,
  selectAuthErr,
);

export const selectIsAuthenticated: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectAccountsState,
  selectIsAuth,
);

export const selectAccountMetadata: MemoizedSelector<
  object,
  AccountMetadata
> = createSelector(
  selectAccountsState,
  selectMetadata,
);

export const selectAccountLoading: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectAccountsState,
  selectAccountLoad,
);
