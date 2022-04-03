export enum MessageType {
  MESSAGE = "MESSAGE",
  INFO = "INFO",
}

export enum ChatType {
  ROOM = "ROOM",
  FRIEND = "FRIEND",
}
export interface ChatTab {
  id: string;
  type: ChatType;
  name: string;
  imageSrc: string;
  data: ChatRoom; // topic is on ChatType Room
}
export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  private: boolean;
}
export interface Message {
  id: string;
  insertedAt: Date;
  text: string;
  owned: boolean;
  profilePictureNum: Number;
  profilePictureSrc: string;
  // type
}
export interface ChatPagination {
  before: string;
  after: string;
  total_count: number;
  limit: number;
}

// Store Requests
export interface AddChatRoomStore {
  chatRoom: ChatRoom;
}
export interface AddOpenChatStore {
  chat: ChatTab;
}
export interface RemoveOpenChatStore {
  chatId: string;
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
  pagination: ChatPagination;
}
