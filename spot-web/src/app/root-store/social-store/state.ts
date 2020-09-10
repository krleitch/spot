import { Friend, FriendRequest } from '@models/friends';
import { Notification } from '@models/notifications';
import { SpotError } from '@exceptions/error';

export interface State {
  friendRequests: FriendRequest[];
  friends: Friend[];
  friendsError: SpotError;
  notifications: Notification[];
  getNotificationsLoading: boolean;
  getNotificationsSuccess: boolean;
  unread: number;
}

export const initialState: State = (
  {
    friendRequests: [],
    friends: [],
    friendsError: null,
    notifications: [],
    getNotificationsLoading: false,
    getNotificationsSuccess: false,
    unread: 0
  }
);
