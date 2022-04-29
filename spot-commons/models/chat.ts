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
  defaultImageSrc: string;
  defaultImageNum: number;
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
  totalCount: number;
  limit: number;
}

// Store Requests
export interface AddUserChatRoomStore {
  chatRoom: ChatRoom;
}
export interface RemoveUserChatRoomStore {
  chatId: string;
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

// Chat Rooms
export interface GetChatRoomsRequest {
  lat: number;
  lng: number;
}

export interface GetChatRoomsResponse {
  chatRooms: Array<ChatRoom>;
  pagination: ChatPagination;
}
export interface GetUserChatRoomsRequest {
  lat: number;
  lng: number;
}
export interface GetUserChatRoomsResponse {
  chatRooms: Array<ChatRoom>;
  pagination: ChatPagination;
}
export interface JoinChatRoomRequest {
  lat: number;
  lng: number;
  chatRoomId: string;
  password?: string;
}
export interface JoinChatRoomResponse {
  chatRoom: ChatRoom;
}
export interface LeaveChatRoomRequest {
  chatRoomId: string;
}
export interface LeaveChatRoomResponse {
  chatRoom: ChatRoom;
}

// Messages
export interface CreateMessage {
  text: string;
}
export interface GetMessagesRequest {
  roomId: string;
  before: string;
}
export interface GetMessagesResponse {
  messages: MessageBlock[];
  pagination: ChatPagination;
}
