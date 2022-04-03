// Models
import { ChatRoom, Message, ChatTab } from '@models/chat';

export interface State {
  loadingChatRooms: boolean;
  chatRooms: ChatRoom[];
  openChats: ChatTab[];
  minimizedChats: ChatTab[];
  messages: { [key: string]: Message[] };
}

export const initialState: State = {
  loadingChatRooms: false,
  chatRooms: [],
  minimizedChats: [],
  openChats: [],
  messages: {}
};
