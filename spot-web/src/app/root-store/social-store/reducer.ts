import { Actions, ActionTypes } from './actions/notifications.actions';
import { FriendsActions, FriendsActionTypes } from './actions/friends.actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions | FriendsActions): State {
  switch (action.type) {
    case ActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      if (action.response.offset === 0) {
        state.notifications = action.response.notifications;
      } else {
        state.notifications = state.notifications.concat(action.response.notifications);
      }
      return {
        ...state
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
        ...state
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
    case FriendsActionTypes.ACCEPT_FRIEND_REQUESTS_SUCCESS: {
      state.friendRequests.forEach( (friend , i) => {
        if (friend.id === action.response.friendRequestId) {
          state.friends.unshift(state.friendRequests[i]);
          state.friendRequests.splice(i, 1);
        }
      });
      return {
        ...state
      };
    }
    case FriendsActionTypes.DECLINE_FRIEND_REQUESTS_SUCCESS: {
      state.friendRequests.forEach( (friend , i) => {
        if (friend.id === action.response.friendRequestId) {
          state.friendRequests.splice(i, 1);
        }
      });
      return {
        ...state
      };
    }
    case FriendsActionTypes.DELETE_FRIENDS_SUCCESS: {
      state.friends.forEach( (friend , i) => {
        if (friend.id === action.response.friendId) {
          state.friends.splice(i, 1);
        }
      });
      return {
        ...state
      };
    }
    default: {
      return state;
    }
  }
}
