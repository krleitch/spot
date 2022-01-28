import {
  NotificationsActionTypes,
  NotificationsActions
} from './actions/notifications.actions';
import { FriendsActionTypes, FriendsActions } from './actions/friends.actions';
import { ActionTypes, Actions } from './actions/actions';
import { State, initialState } from './state';

export function featureReducer(
  state = initialState,
  action: NotificationsActions | FriendsActions | Actions
): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_REQUEST: {
      return {
        ...state,
        notificationsSuccess: false,
        notificationsLoading: true
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        notificationsSuccess: true,
        notificationsLoading: false,
        notifications: !action.response.initialLoad
          ? action.response.notifications
          : state.notifications.concat(action.response.notifications)
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_FAILURE: {
      return {
        ...state,
        notificationsSuccess: false,
        notificationsLoading: false
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_UNREAD_SUCCESS: {
      return {
        ...state,
        unreadNotifications: action.response.unread
      };
    }
    case NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        unreadNotifications: 0,
        notifications: []
      };
    }
    case NotificationsActionTypes.DELETE_NOTIFICATION_SUCCESS: {
      return {
        ...state,
        unreadNotifications: state.notifications.filter(
          (item) => item.id === action.response.notificationId
        )[0].seen
          ? state.unreadNotifications
          : state.unreadNotifications - 1,
        notifications: state.notifications.filter(
          (item) => item.id !== action.response.notificationId
        )
      };
    }
    case NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS: {
      const newNotifications = Array.from(state.notifications);

      state.notifications.forEach((notif, i) => {
        const newObj = Object.assign({}, notif);
        newObj.seen = 1;
        newNotifications[i] = newObj;
      });

      return {
        ...state,
        unreadNotifications: 0,
        notifications: newNotifications
      };
    }
    case NotificationsActionTypes.SET_NOTIFICATION_SEEN_SUCCESS: {
      const newNotifications = Array.from(state.notifications);

      state.notifications.forEach((notif, i) => {
        const newObj = Object.assign({}, notif);
        if (notif.id === action.response.notificationId) {
          newObj.seen = 1;
          newNotifications[i] = newObj;
        }
      });
      return {
        ...state,
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
        notifications: newNotifications
      };
    }
    case FriendsActionTypes.GET_FRIENDS_SUCCESS: {
      return {
        ...state,
        friends: action.response.friends
      };
    }
    case FriendsActionTypes.ADD_FRIEND: {
      const newFriends = Array.from(state.friends);
      newFriends.unshift(action.request.friend);
      return {
        ...state,
        friends: newFriends
      };
    }
    case FriendsActionTypes.DELETE_FRIENDS_SUCCESS: {
      const newFriends = Array.from(state.friends);

      newFriends.forEach((friend, i) => {
        if (friend.id === action.response.friendId) {
          newFriends.splice(i, 1);
        }
      });
      return {
        ...state,
        friends: newFriends
      };
    }
    default: {
      return state;
    }
  }
}
