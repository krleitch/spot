import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        notifications: action.response.notifications,
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
      };
    }
    default: {
      return state;
    }
  }
}
