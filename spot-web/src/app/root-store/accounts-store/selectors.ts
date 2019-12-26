import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

export const selectUserToken = (state: State): any => state.idToken;
export const selectExpireIn = (state: State): any => state.expireIn;
export const selectError = (state: State): any => state.error;
export const selectLoggedIn = (state: State): any => state.loggedIn;
export const selectUser = (state: State): any => state.user;

export const selectMyFeatureState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('accounts');

export const selectMyFeatureLoggedIn: MemoizedSelector<
  object,
  any
> = createSelector(
  selectMyFeatureState,
  selectLoggedIn
);

export const selectMyFeatureUser: MemoizedSelector<
  object,
  any
> = createSelector(
  selectMyFeatureState,
  selectUser
);
