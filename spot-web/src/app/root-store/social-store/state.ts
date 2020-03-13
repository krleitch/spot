import { Notification } from '@models/notifications';

export interface State {
  notifications: Notification[];
  unread: number;
}

export const initialState: State = (
  {
    notifications: [],
    unread: 0
  }
);
