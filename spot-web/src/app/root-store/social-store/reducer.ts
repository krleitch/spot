import { NotificationsActions, NotificationsActionTypes } from './actions/notifications.actions';
import { FriendsActions, FriendsActionTypes } from './actions/friends.actions';
import { Actions, ActionTypes } from './actions/actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: NotificationsActions | FriendsActions | Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState,
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_REQUEST: {
      return {
        ...state,
        getNotificationsSuccess: false,
        getNotificationsLoading: true,
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        getNotificationsSuccess: true,
        getNotificationsLoading: false,
        notifications: !action.response.date ? action.response.notifications : state.notifications.concat(action.response.notifications)
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_FAILURE: {
      return {
        ...state,
        getNotificationsSuccess: false,
        getNotificationsLoading: false
      };
    }
    case NotificationsActionTypes.GET_NOTIFICATIONS_UNREAD_SUCCESS: {
      return {
        ...state,
        unread: action.response.unread
      };
    }
    case NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        notifications: []
      };
    }
    case NotificationsActionTypes.DELETE_NOTIFICATION_SUCCESS: {
      return {
        ...state,
        notifications: state.notifications.filter( item => item.id !== action.response.notificationId )
      };
    }
    case NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS: {

      let newNotifications = Object.assign({}, state.notifications);

      newNotifications.forEach( notif => {
        notif.seen = 1;
      });

      return {
        ...state,
        unread: 0,
        notifications: newNotifications
      };
    }
    case NotificationsActionTypes.SET_NOTIFICATION_SEEN_SUCCESS: {

      let newNotifications = Object.assign({}, state.notifications);

      newNotifications.forEach( notif => {
        if ( notif.id === action.response.notificationId ) {
          notif.seen = 1;
        }
      });
      return {
        ...state,
        unread: Math.max(0, state.unread - 1),
        notifications: newNotifications
      };
    }
    case FriendsActionTypes.GET_FRIEND_REQUESTS_SUCCESS: {
      return {
        ...state,
        friendRequests: action.response.friendRequests
      };
    }
    case FriendsActionTypes.GET_FRIENDS_SUCCESS: {
      return {
        ...state,
        friends: action.response.friends
      };
    }
    case FriendsActionTypes.ADD_FRIEND_REQUESTS_FAILURE: {
      return {
        ...state,
        friendsError: action.error
      };
    }
    case FriendsActionTypes.ACCEPT_FRIEND_REQUESTS_SUCCESS: {

      let newFriendRequests = Object.assign({}, state.friendRequests);
      let newFriends = Object.assign({}, state.friends);

      newFriendRequests.forEach( (friend , i) => {
        if (friend.id === action.response.friend.id) {
          newFriends.unshift(action.response.friend);
          newFriendRequests.splice(i, 1);
        }
      });
      return {
        ...state,
        friends: newFriends,
        friendRequests: newFriendRequests
      };
    }
    case FriendsActionTypes.DECLINE_FRIEND_REQUESTS_SUCCESS: {

      let newFriendRequests = Object.assign({}, state.friendRequests);

      newFriendRequests.forEach( (friend , i) => {
        if (friend.id === action.response.friendRequestId) {
          newFriendRequests.splice(i, 1);
        }
      });
      return {
        ...state,
        friendRequests: newFriendRequests
      };
    }
    case FriendsActionTypes.DELETE_FRIENDS_SUCCESS: {

      let newFriends = Object.assign({}, state.friends);

      newFriends.forEach( (friend , i) => {
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
