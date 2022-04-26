// Models

import { ChatRoom, Message, ChatPagination } from '@models/chat';

export interface State {
  loadingChatRooms: boolean;
  loadingUserChatRooms: boolean;
  chatRooms: ChatRoom[];
  chatRoomsPagination: ChatPagination;
  userChatRooms: ChatRoom[];
  userChatRoomsPagination: ChatPagination;
  openChats: ChatRoom[];
  minimizedChats: ChatRoom[];
  messages: { [key: string]: Message[] };
}

export const initialState: State = {
  loadingChatRooms: false,
  loadingUserChatRooms: false,
  chatRooms: [],
  chatRoomsPagination: {
    after: null,
    before: null,
    total_count: 0,
    limit: 0
  },
  userChatRooms: [],
  userChatRoomsPagination: {
    after: null,
    before: null,
    total_count: 0,
    limit: 0
  },
  minimizedChats: [],
  openChats: [],
  messages: {}
};
