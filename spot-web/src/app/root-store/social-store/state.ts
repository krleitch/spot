import { Friend, FriendRequest } from '@models/friends';
import { Notification } from '@models/notifications';
import { SpotError } from '@exceptions/error';

export interface State {
  friendRequests: FriendRequest[];
  friends: Friend[];
  friendsError: SpotError;
  notifications: Notification[];
  unread: number;
}

export const initialState: State = (
  {
    friendRequests: [],
    friends: [],
    friendsError: null,
    notifications: [],
    unread: 0
  }
);
