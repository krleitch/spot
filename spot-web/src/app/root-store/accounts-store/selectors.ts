import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { SpotError } from '@exceptions/error';
import { AccountMetadata, Account } from '@models/accounts';

import { State } from './state';

export const selectAccount = (state: State): Account => state.account;
export const selectMetadata = (state: State): AccountMetadata => state.accountMetadata;
export const selectLoadingLocation = (state: State): boolean => state.loadingLocation;
export const selectLocation = (state: State): any => state.location;
export const selectFacebook = (state: State): boolean => state.facebookConnected;
export const selectAuthErr = (state: State): SpotError => state.authenticationError;
export const selectIsAuth = (state: State): boolean => state.account ? true : false;
export const selectUsernameErr = (state: State): SpotError => state.usernameError;
export const selectUsernameSuc = (state: State): boolean => state.usernameSuccess;

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

export const selectUsernameError: MemoizedSelector<
  object,
  SpotError
> = createSelector(
  selectAccountsState,
  selectUsernameErr,
);

export const selectUsernameSuccess: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectAccountsState,
  selectUsernameSuc,
);
