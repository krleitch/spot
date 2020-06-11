import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { SpotError } from '@exceptions/error';

import { State } from './state';

export const selectAccount = (state: State): any => state.account;
export const selectLocation = (state: State): any => state.location;
export const selectFacebook = (state: State): boolean => state.facebookConnected;
export const selectAuthErr = (state: State): SpotError => state.authError;
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

export const selectFacebookConnected: MemoizedSelector<
  object,
  any
> = createSelector(
  selectAccountsState,
  selectFacebook,
);

export const selectAuthError: MemoizedSelector<
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
