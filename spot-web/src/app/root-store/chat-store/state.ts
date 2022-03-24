// Models
import { ChatRoom } from '@models/chat';

export interface State {
  chatRooms: ChatRoom[];
}

export const initialState: State = {
  chatRooms: []
};
