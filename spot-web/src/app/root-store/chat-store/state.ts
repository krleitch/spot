// models
import { ChatRoom, Message, ChatPagination, ChatTab } from '@models/chat';
import { Friend } from '@models/friend';

export interface State {
  // Chats rooms and user chat rooms
  loadingChatRooms: boolean;
  loadingUserChatRooms: boolean;
  chatRooms: ChatRoom[];
  chatRoomsPagination: ChatPagination;
  userChatRooms: ChatRoom[];
  userChatRoomsPagination: ChatPagination;

  // chat menu state
  openChats: Array<ChatTab>;
  minimizedChats: Array<ChatTab>;

  // chat page state
  chatPageOpenChat: ChatTab;
  chatPageMinimizedChats: Array<ChatTab>;

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
