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
  imageSrc: string;
  data?: ChatRoom; // topic is on ChatType Room
}
export interface Message {
  id: string;
  insertedAt: Date;
  text: string;
  owned: boolean;
  profilePictureNum: Number;
  profilePictureSrc: string;
  // timestamp: Date;
  // owned?: boolean;
  // profilePicture?: number; // The enumeration of the image (colour)
  // profilePictureSrc?: number; // The image
  // type: MessageType;
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
export interface CreateMessage {
  text: string;
}

export interface GetChatRoomsRequest {}

export interface ChatPagination {
  before: string;
  after: string;
  total_count: number;
  limit: number;
}

export interface GetChatRoomsResponse {
  chatRooms: Array<ChatRoom>;
  pagination: ChatPagination;
}

export interface GetMessagesRequest {
  roomId: string;
  before: string;
}

export interface GetMessagesResponse {
  messages: Message[];
}


