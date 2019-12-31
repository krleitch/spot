import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

export const selectAccount = (state: State): any => state.account;

export const selectAccountsState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('accounts');

export const selectAccountsUser: MemoizedSelector<
  object,
  any
> = createSelector(
  selectAccountsState,
  selectAccount
);
