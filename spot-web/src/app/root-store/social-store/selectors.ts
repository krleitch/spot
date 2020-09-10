import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

import { Notification } from '@models/notifications';
import { Friend, FriendRequest } from '@models/friends';
import { SpotError } from '@exceptions/error';

export const selectFriendRequests = (state: State): FriendRequest[] => state.friendRequests;
export const selectFriends = (state: State): Friend[] => state.friends;
export const selectFriendsErrorMessage = (state: State): SpotError => state.friendsError;
export const selectNotifications = (state: State): Notification[] => state.notifications;
export const getNotificationsLoading = (state: State): boolean => state.getNotificationsLoading;
export const getNotificationsSuccess = (state: State): boolean => state.getNotificationsSuccess;
export const selectUnread = (state: State): number => state.unread;

export const selectMyFeatureState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('social');

export const selectMyFeatureNotifications: MemoizedSelector<
  object,
  Notification[]
> = createSelector(
  selectMyFeatureState,
  selectNotifications
);

export const selectGetNotificationsLoading: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectMyFeatureState,
  getNotificationsLoading
);

export const selectGetNotificationsSuccess: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectMyFeatureState,
  getNotificationsSuccess
);

export const selectMyFeatureUnread: MemoizedSelector<
  object,
  number
> = createSelector(
  selectMyFeatureState,
  selectUnread
);

export const selectMyFeatureFriends: MemoizedSelector<
  object,
  Friend[]
> = createSelector(
  selectMyFeatureState,
  selectFriends
);

export const selectMyFeatureFriendRequests: MemoizedSelector<
  object,
  FriendRequest[]
> = createSelector(
  selectMyFeatureState,
  selectFriendRequests
);

export const selectFriendsError: MemoizedSelector<
  object,
  SpotError
> = createSelector(
  selectMyFeatureState,
  selectFriendsErrorMessage
);
