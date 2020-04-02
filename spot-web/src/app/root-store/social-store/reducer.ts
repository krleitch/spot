import { Actions, ActionTypes } from './actions/notifications.actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      if (action.response.offset === 0) {
        state.notifications = action.response.notifications;
      } else {
        state.notifications = state.notifications.concat(action.response.notifications);
      }
      return {
        ...state,
      };
    }
    case ActionTypes.GET_NOTIFICATIONS_UNREAD_SUCCESS: {
      return {
        ...state,
        unread: action.response.unread
      };
    }
    case ActionTypes.ADD_NOTIFICATION_SUCCESS: {
      return {
        ...state,
      };
    }
    case ActionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        notifications: []
      };
    }
    case ActionTypes.DELETE_NOTIFICATION_SUCCESS: {
      state.notifications = state.notifications.filter( item => item.id !== action.response.notificationId );
      return {
        ...state,
      };
    }
    case ActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS: {
      state.notifications.forEach( notif => {
        notif.seen = 1;
      });
      return {
        ...state,
        unread: 0
      };
    }
    default: {
      return state;
    }
  }
}
