import { Actions, ActionTypes } from './actions/notifications.actions';
import { FriendsActions, FriendsActionTypes } from './actions/friends.actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions | FriendsActions): State {
  switch (action.type) {
    case ActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      let notifications = [ ...state.notifications ];
      if (action.response.offset === 0) {
        notifications = action.response.notifications;
      } else {
        notifications = notifications.concat(action.response.notifications);
      }
      return {
        ...state,
        notifications
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
      let notifications = [ ...state.notifications ];
      notifications = notifications.filter( item => item.id !== action.response.notificationId );
      return {
        ...state,
        notifications
      };
    }
    case ActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS: {
      const notifications = [ ...state.notifications ];
      notifications.forEach( notif => {
        notif.seen = 1;
      });
      return {
        ...state,
        unread: 0,
        notifications
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
      const friendRequests = [ ...state.friendRequests ];
      const friends = [ ...state.friends ];
      friendRequests.forEach( (friend , i) => {
        if (friend.id === action.response.friendRequestId) {
          friends.unshift(friendRequests[i]);
          friendRequests.splice(i, 1);
        }
      });
      return {
        ...state,
        friendRequests,
        friends
      };
    }
    case FriendsActionTypes.DECLINE_FRIEND_REQUESTS_SUCCESS: {
      const friendRequests = [ ...state.friendRequests ];
      friendRequests.forEach( (friend , i) => {
        if (friend.id === action.response.friendRequestId) {
          friendRequests.splice(i, 1);
        }
      });
      return {
        ...state,
        friendRequests
      };
    }
    case FriendsActionTypes.DELETE_FRIENDS_SUCCESS: {
      const friends = [ ...state.friends ];
      friends.forEach( (friend , i) => {
        if (friend.id === action.response.friendId) {
          friends.splice(i, 1);
        }
      });
      return {
        ...state,
        friends
      };
    }
    default: {
      return state;
    }
  }
}
