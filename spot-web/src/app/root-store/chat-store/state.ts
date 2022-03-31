// Models
import { ChatRoom, Message } from '@models/chat';

// interface ChatRoomStore extends ChatRoom {
// messages: Message[];
// }

export interface State {
  loadingChatRooms: boolean;
  chatRooms: ChatRoom[];
  openChatRooms: string[];
}

export const initialState: State = {
  loadingChatRooms: false,
  chatRooms: [],
  openChatRooms: []
};
