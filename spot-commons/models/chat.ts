export enum MessageType {
    MESSAGE = 'MESSAGE',
    INFO = 'INFO',
}

export enum ChatType {
  ROOM = 'ROOM',
  FRIEND = 'FRIEND'
}
export interface Tab {
  id: string;
  type: ChatType;
  name: string;
}
export interface Message {
    content: string;
    timestamp: Date;
    owned?: boolean;
    profilePicture?: number; // The enumeration of the image (colour)
    profilePictureSrc?: number; // The image
    type: MessageType;
}

export interface NewMessage {
    content: string;
}