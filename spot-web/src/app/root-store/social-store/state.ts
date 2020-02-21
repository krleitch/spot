import { Notification } from '@models/notifications';

export interface State {
  notifications: Notification[];
}

export const initialState: State = (
  {
    notifications: [],
  }
);
