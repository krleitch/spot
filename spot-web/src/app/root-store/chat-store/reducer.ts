import { ActionTypes, Actions } from './actions';
import { State, initialState } from './state';

// Models
import { ChatType, ChatRoom } from '@models/chat';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    // Store requests
    case ActionTypes.ADD_USER_CHAT_ROOM_STORE: {
      return {
        ...state,
        userChatRooms: state.userChatRooms.concat(action.request.chatRoom)
      };
    }
    // TODO: will also need to remove a friend from chats if he is unfriended
    case ActionTypes.REMOVE_USER_CHAT_ROOM_STORE: {
      return {
        ...state,
        userChatRooms: state.userChatRooms.filter(
          (r) => r.id !== action.request.chatId
        ),
        openChats: state.openChats.filter((r) =>
          r.type === ChatType.ROOM
            ? (r.data as ChatRoom).id !== action.request.chatId
            : true
        ),
        minimizedChats: state.minimizedChats.filter((r) =>
          r.type === ChatType.ROOM
            ? (r.data as ChatRoom).id !== action.request.chatId
            : true
        )
      };
    }
    // Menu
    case ActionTypes.ADD_OPEN_CHAT_STORE: {
      return {
        ...state,
        openChats: state.openChats.concat(action.request.tab)
      };
    }
    case ActionTypes.REMOVE_OPEN_CHAT_STORE: {
      return {
        ...state,
        openChats: state.openChats.filter((r) => r.tabId !== action.request.tabId)
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
    // Page
    case ActionTypes.SET_PAGE_OPEN_CHAT_STORE: {
      return {
        ...state,
        chatPageOpenChat: action.request.tab
      };
    }
    case ActionTypes.REMOVE_PAGE_OPEN_CHAT_STORE: {
      return {
        ...state,
        chatPageOpenChat: null
      };
    }
    case ActionTypes.ADD_PAGE_MINIMIZED_CHAT_STORE: {
      return {
        ...state,
        chatPageMinimizedChats: state.chatPageMinimizedChats.concat(
          action.request.tab
        )
      };
    }
    case ActionTypes.REMOVE_PAGE_MINIMIZED_CHAT_STORE: {
      return {
        ...state,
        chatPageMinimizedChats: state.chatPageMinimizedChats.filter(
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
      return {
        ...state,
        chatRooms: action.response.chatRooms,
        chatRoomsPagination: action.response.pagination,
        loadingChatRooms: false
      };
    }
    case ActionTypes.GET_CHAT_ROOMS_FAILURE: {
      return {
        ...state,
        loadingChatRooms: false
      };
    }
    case ActionTypes.GET_USER_CHAT_ROOMS_REQUEST: {
      return {
        ...state,
        loadingUserChatRooms: true
      };
    }
    case ActionTypes.GET_USER_CHAT_ROOMS_SUCCESS: {
      return {
        ...state,
        userChatRooms: action.response.chatRooms,
        userChatRoomsPagination: action.response.pagination,
        loadingUserChatRooms: false
      };
    }
    case ActionTypes.GET_USER_CHAT_ROOMS_FAILURE: {
      return {
        ...state,
        loadingUserChatRooms: false
      };
    }
    default: {
      return state;
    }
  }
}
