import { ActionTypes, Actions } from './actions';
import { State, initialState } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    // Store requests
    case ActionTypes.ADD_CHAT_ROOM_STORE: {
      return {
        ...state,
        chatRooms: state.chatRooms.concat(action.request.chatRoom)
      };
    }
    case ActionTypes.ADD_OPEN_CHAT_STORE: {
      return {
        ...state,
        openChats: state.openChats.concat(action.request.tab)
      };
    }
    case ActionTypes.REMOVE_OPEN_CHAT_STORE: {
      return {
        ...state,
        openChats: state.openChats.filter(
          (r) => r.tabId !== action.request.tabId
        )
      };
    }
    case ActionTypes.ADD_MINIMIZED_CHAT_STORE: {
      return {
        ...state,
        minimizedChats: state.minimizedChats.concat(action.request.tab)
      };
    }
    case ActionTypes.REMOVE_MINIMIZED_CHAT_STORE: {
      return {
        ...state,
        minimizedChats: state.minimizedChats.filter(
          (r) => r.tabId !== action.request.tabId
        )
      };
    }
    // Requests
    case ActionTypes.GET_CHAT_ROOMS_REQUEST: {
      return {
        ...state,
        loadingChatRooms: true
      };
    }
    case ActionTypes.GET_CHAT_ROOMS_SUCCESS: {
      console.log(action.response);
      return {
        ...state,
        chatRooms: action.response.chatRooms,
        loadingChatRooms: false
      };
    }
    case ActionTypes.GET_CHAT_ROOMS_FAILURE: {
      return {
        ...state,
        loadingChatRooms: false
      };
    }
    default: {
      return state;
    }
  }
}
