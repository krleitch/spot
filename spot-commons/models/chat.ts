export enum MessageType {
  MESSAGE = "MESSAGE",
  INFO = "INFO",
}

export enum ChatType {
  ROOM = "ROOM",
  FRIEND = "FRIEND",
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  private: boolean;
  distance: number;
  geolocation: string;
  capacity: number;
  numUsers: number;
  insertedAt: string;
}

// A Message block is seperated by different users or time
export interface MessageBlock {
  insertedAt: string; // the time of the first message
  owned: boolean;
  showDate: boolean; // should the block show a date before it
  profilePictureNum: Number;
  profilePictureSrc: string;
  chatProfileId: string; // The chat identifier for the user // is not the userId
  messages: Array<{ id: string; text: string; insertedAt: string }>;
}

export interface Message {
  id: string;
  insertedAt: string;
  text: string;
  owned: boolean;
  chatProfileId: string; // The chat identifier for the user // is not the userId
  profilePictureNum: Number;
  profilePictureSrc: string;
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
  chat: ChatRoom;
}
export interface RemoveOpenChatStore {
  chatId: string;
}
export interface AddMinimizedChatStore {
  chat: ChatRoom;
}
export interface RemoveMinimizedChatStore {
  chatId: string;
}

// Chat-Server Requests
export interface CreateChatRoomRequest {
  name: string;
  description: string;
  password: string;
  lat: number;
  lng: number;
  imageSrc?: string;
}
export interface CreateChatRoomResponse {
  chatRoom: ChatRoom;
}
export interface CreateMessage {
  text: string;
}

export interface GetChatRoomsRequest {
  lat: number;
  lng: number;
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
  messages: MessageBlock[];
  pagination: ChatPagination;
}
