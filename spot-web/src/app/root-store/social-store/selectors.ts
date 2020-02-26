import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { Notification } from '@models/notifications';
import { State } from './state';

export const selectNotifications = (state: State): Notification[] => state.notifications;

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
