import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { Notification } from '@models/notifications';
import { State } from './state';

export const selectNotifications = (state: State): Notification[] => state.notifications;
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

export const selectMyFeatureUnread: MemoizedSelector<
  object,
  number
> = createSelector(
  selectMyFeatureState,
  selectUnread
);
