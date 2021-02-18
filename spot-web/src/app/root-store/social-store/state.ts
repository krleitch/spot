import { Friend, FriendRequest } from '@models/friends';
import { Notification } from '@models/notifications';
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
  unreadNotifications: number;
}

export const initialState: State = (
  {
    friends: [],
    friendsLoading: false,
    friendsError: null,
    friendsSuccess: false,
    notifications: [],
    notificationsLoading: false,
    notificationsError: null,
    notificationsSuccess: false,
    unreadNotifications: 0
  }
);
