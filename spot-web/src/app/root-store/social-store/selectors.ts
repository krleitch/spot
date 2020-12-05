import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

import { Notification } from '@models/notifications';
import { Friend, FriendRequest } from '@models/friends';
import { SpotError } from '@exceptions/error';

export const selectFriendRequestsFromStore = (state: State): FriendRequest[] => state.friendRequests;
export const selectFriendsFromStore = (state: State): Friend[] => state.friends;
export const selectFriendsErrorFromStore = (state: State): SpotError => state.friendsError;
export const selectNotificationsFromStore = (state: State): Notification[] => state.notifications;
export const selectGetNotificationsLoadingFromStore = (state: State): boolean => state.getNotificationsLoading;
export const selectGetNotificationsSuccessFromStore = (state: State): boolean => state.getNotificationsSuccess;
export const selectUnreadFromStore = (state: State): number => state.unread;

export const selectSocialState: MemoizedSelector<object, State> = createFeatureSelector<State>('social');

export const selectNotifications: MemoizedSelector<object, Notification[]> = createSelector(
  selectSocialState,
  selectNotificationsFromStore
);

export const selectGetNotificationsLoading: MemoizedSelector<object, boolean> = createSelector(
  selectSocialState,
  selectGetNotificationsLoadingFromStore
);

export const selectGetNotificationsSuccess: MemoizedSelector<object, boolean> = createSelector(
  selectSocialState,
  selectGetNotificationsSuccessFromStore
);

export const selectUnread: MemoizedSelector<object, number> = createSelector(
  selectSocialState,
  selectUnreadFromStore
);

export const selectFriends: MemoizedSelector<object, Friend[]> = createSelector(
  selectSocialState,
  selectFriendsFromStore
);

export const selectFriendRequests: MemoizedSelector<object, FriendRequest[]> = createSelector(
  selectSocialState,
  selectFriendRequestsFromStore
);

export const selectFriendsError: MemoizedSelector<object, SpotError> = createSelector(
  selectSocialState,
  selectFriendsErrorFromStore
);
