// Models

import { ChatRoom, Message, ChatPagination } from '@models/chat';

export interface State {
  // Chats rooms and user chat rooms
  loadingChatRooms: boolean;
  loadingUserChatRooms: boolean;
  chatRooms: ChatRoom[];
  chatRoomsPagination: ChatPagination;
  userChatRooms: ChatRoom[];
  userChatRoomsPagination: ChatPagination;

  // chat menu state
  openChats: ChatRoom[];
  minimizedChats: ChatRoom[];

  // chat page state
  chatPageOpenChat: ChatRoom;
  chatPageMinimizedChats: ChatRoom[];

  messages: { [key: string]: Message[] };
}

export const initialState: State = {
  loadingChatRooms: false,
  loadingUserChatRooms: false,
  chatRooms: [],
  chatRoomsPagination: {
    after: null,
    before: null,
    totalCount: 0,
    limit: 0
  },
  userChatRooms: [],
  userChatRoomsPagination: {
    after: null,
    before: null,
    totalCount: 0,
    limit: 0
  },

  // menu
  minimizedChats: [],
  openChats: [],

  // page
  chatPageOpenChat: undefined,
  chatPageMinimizedChats: [],

  messages: {}
};
