import { Friend } from '@models/../newModels/friend';
import { Notification } from '@models/../newModels/notification';
import { SpotError } from '@exceptions/error';

export interface State {
  friends: Friend[];
  friendsLoading: boolean;
  friendsError: SpotError;
  friendsSuccess: boolean;
  notifications: Notification[];
  notificationsLoading: boolean;
  notificationsError: SpotError;
  notificationsSuccess: boolean;
  totalUnseenNotifications: number;
}

export const initialState: State = {
  friends: [],
  friendsLoading: false,
  friendsError: null,
  friendsSuccess: false,
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,
  notificationsSuccess: false,
  totalUnseenNotifications: 0
};
