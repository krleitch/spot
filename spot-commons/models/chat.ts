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
    id: string
  }
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
  id: number;
  topic: string;
  name: string;
}

// Upload the chat room image to the spot-server
export interface UploadChatRoomImageRequest {
  image: File
}
export interface UploadChatRoomImageResponse {
  imageSrc: string;
}

// Chat-Server Requests
export interface CreateChatRoomRequest {
  name: string;
  description: string;
  public: boolean;
  imageSrc: string;
}

export interface findAllChatRooms {

}