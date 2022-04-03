export enum MessageType {
  MESSAGE = "MESSAGE",
  INFO = "INFO",
}

export enum ChatType {
  ROOM = "ROOM",
  FRIEND = "FRIEND",
}
export interface ChatTab {
  tabId: string;
  type: ChatType;
  name: string;
  imageSrc: string;
  chat: ChatRoom; // topic is on ChatType Room
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
  insertedAt: string;
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
  tab: ChatTab;
}
export interface RemoveOpenChatStore {
  tabId: string;
}
export interface AddMinimizedChatStore {
  tab: ChatTab;
}
export interface RemoveMinimizedChatStore {
  tabId: string;
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
