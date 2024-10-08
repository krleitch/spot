import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { State } from './state';

import { Notification } from '@models/notification';
import { Friend } from '@models/friend';
import { SpotError } from '@exceptions/error';

export const selectFriendsFromStore = (state: State): Friend[] => state.friends;
export const selectFriendsLoadingFromStore = (state: State): boolean =>
  state.friendsLoading;
export const selectFriendsErrorFromStore = (state: State): SpotError =>
  state.friendsError;
export const selectFriendsSuccessFromStore = (state: State): boolean =>
  state.friendsSuccess;
export const selectNotificationsFromStore = (state: State): Notification[] =>
  state.notifications;
export const selectNotificationsLoadingFromStore = (state: State): boolean =>
  state.notificationsLoading;
export const selectNotificationsSuccessFromStore = (state: State): boolean =>
  state.notificationsSuccess;
export const selectNotificationsErrorFromStore = (state: State): SpotError =>
  state.notificationsError;
export const selectTotalUnseenNotificationsFromStore = (state: State): number =>
  state.totalUnseenNotifications;

export const selectSocialState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('social');

export const selectNotifications: MemoizedSelector<object, Notification[]> =
  createSelector(selectSocialState, selectNotificationsFromStore);

export const selectNotificationsLoading: MemoizedSelector<object, boolean> =
  createSelector(selectSocialState, selectNotificationsLoadingFromStore);

export const selectNotificationsSuccess: MemoizedSelector<object, boolean> =
  createSelector(selectSocialState, selectNotificationsSuccessFromStore);

export const selectNotificationsError: MemoizedSelector<object, SpotError> =
  createSelector(selectSocialState, selectNotificationsErrorFromStore);

export const selectTotalUnseenNotifications: MemoizedSelector<object, number> =
  createSelector(selectSocialState, selectTotalUnseenNotificationsFromStore);

export const selectFriends: MemoizedSelector<object, Friend[]> = createSelector(
  selectSocialState,
  selectFriendsFromStore
);

export const selectFriendsLoading: MemoizedSelector<object, boolean> =
  createSelector(selectSocialState, selectFriendsLoadingFromStore);

export const selectFriendsSuccess: MemoizedSelector<object, boolean> =
  createSelector(selectSocialState, selectFriendsSuccessFromStore);

export const selectFriendsError: MemoizedSelector<object, SpotError> =
  createSelector(selectSocialState, selectFriendsErrorFromStore);
