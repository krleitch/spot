// Models

import { ChatRoom, Message } from '@models/chat';

export interface State {
  loadingChatRooms: boolean;
  loadingUserChatRooms: boolean;
  chatRooms: ChatRoom[];
  userChatRooms: ChatRoom[];
  openChats: ChatRoom[];
  minimizedChats: ChatRoom[];
  messages: { [key: string]: Message[] };
}

export const initialState: State = {
  loadingChatRooms: false,
  loadingUserChatRooms: false,
  chatRooms: [],
  userChatRooms: [],
  minimizedChats: [],
  openChats: [],
  messages: {}
};
