export interface ModalOptions {
  width?: number | "auto";
  height?: number | "auto";
  disableClose?: boolean; // close when the background is clicked
  darkenBackground?: boolean; // does the background change color
}

export type ModalComponents =
  | "share"
  | "report"
  | "confirm"
  | "image"
  | "terms"
  | "auth"
  | "welcome"
  | "uploadPhoto"
  | "chatCreate";

// ********************
// DATA
// ********************

export type ModalData =
  | ModalShareData
  | ModalConfirmData
  | ModalReportData
  | ModalImageData
  | ModalUploadPhotoData;

export interface ModalShareData {
  spotId: string;
  spotLink: string;
  commentId?: string;
  commentLink?: string;
}

export interface ModalConfirmData {
  message: string;
}

export interface ModalReportData {
  spotId: string;
  commentId?: string;
}

export interface ModalImageData {
  imageSrc: string;
}

export interface ModalUploadPhotoData {
  type?: 'profile-picture' | 'create-chat';
  imageSrc?: string; // The current photo to show, or no photo
}

// ********************
// RESULTS
// ********************

export type ModalResult = ModalConfirmResult | ModalUploadPhotoResult;

export enum ModalConfirmResultTypes {
  CONFIRM = "CONFIRM",
  CANCEL = "CANCEL",
}
export interface ModalConfirmResult {
  status: ModalConfirmResultTypes;
}

export interface ModalUploadPhotoResult {
  imageSrc?: string; // the location of the created image
}
