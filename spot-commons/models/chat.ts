export enum MessageType {
  MESSAGE = "MESSAGE",
  INFO = "INFO",
}

export enum ChatType {
  ROOM = "ROOM",
  FRIEND = "FRIEND",
}
export interface Tab {
  id: string;
  type: ChatType;
  name: string;
  data?: ChatRoom; // topic is on ChatType Room
}
export interface Message {
  id: string;
  inserted_at: Date;
  text: string;
  user: {
    id: string;
  };
  // timestamp: Date;
  // owned?: boolean;
  // profilePicture?: number; // The enumeration of the image (colour)
  // profilePictureSrc?: number; // The image
  // type: MessageType;
}

export interface NewMessage {
  text: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  private: boolean;
}

// Store

export interface AddChatRoomStore {
  chatRoom: ChatRoom;
}

// Chat-Server Requests
export interface CreateChatRoomRequest {
  name: string;
  description: string;
  private: boolean;
  imageSrc?: string;
}
export interface CreateChatRoomResponse {
  chatRoom: ChatRoom;
}

export interface GetChatRoomsRequest {}

export interface GetChatRoomsResponse {
  chatRooms: Array<ChatRoom>;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalEntries: number;
  };
}
