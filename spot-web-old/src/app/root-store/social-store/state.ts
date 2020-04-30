import { Friend, FriendRequest } from '@models/friends';
import { Notification } from '@models/notifications';

export interface State {
  friendRequests: FriendRequest[];
  friends: Friend[];
  notifications: Notification[];
  unread: number;
}

export const initialState: State = (
  {
    friendRequests: [],
    friends: [],
    notifications: [],
    unread: 0
  }
);
