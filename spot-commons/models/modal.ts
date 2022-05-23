export interface ModalOptions {
  width?: number | "auto";
  height?: number | "auto";
  disableClose?: boolean; // close when the background is clicked
  darkenBackground?: boolean; // does the background change color
  hideModals?: boolean; // hide all other modals when this is open, show when closed
  fullscreen?: boolean; // cover the entire screen
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
  | "chatCreate"
  | "chatDiscover"
  | "chatModal"
  | "accountEdit";

// ********************
// DATA
// ********************

export type ModalData =
  | ModalShareData
  | ModalConfirmData
  | ModalReportData
  | ModalImageData
  | ModalUploadPhotoData
  | ModalAccountEditData;

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
export interface ModalAccountEditData {
  type: 'username' | 'email' | 'phone';
  data: string;
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
  // profile picture returns this
  imageSrc?: string; // the location of the created image, if created
  // create-chat returns this
  image?: File; // the file, if we didnt create it yet
}
