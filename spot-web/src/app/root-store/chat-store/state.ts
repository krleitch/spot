// Models
import { ChatRoom, Message } from '@models/chat';

export interface State {
  loadingChatRooms: boolean;
  chatRooms: ChatRoom[];
  openChats: ChatRoom[];
  minimizedChats: ChatRoom[];
  messages: { [key: string]: Message[] };
}

export const initialState: State = {
  loadingChatRooms: false,
  chatRooms: [],
  minimizedChats: [],
  openChats: [],
  messages: {}
};
