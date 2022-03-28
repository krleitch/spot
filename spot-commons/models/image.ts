import { User } from './user';

export enum UserImageType {
  PROFILE_PICTURE = "PROFILE_PICTURE",
  CHAT_ROOM = "CHAT_ROOM"
}

// Profile Picture
export interface UploadProfilePictureRequest {
  image: File;
}
export interface UploadProfilePictureResponse {
  user: User;
}
export interface DeleteProfilePictureRequest {}
export interface DeleteProfilePictureResponse {
  user: User;
}

// Chat Photo
export interface UploadChatRoomPhotoRequest {
  image: File,
}
export interface UploadChatRoomPhotoResponse {
  imageSrc: string;
}
export interface DeleteChatRoomPhotoRequest {}
export interface DeleteChatRoomPhotoResponse {}