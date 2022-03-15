export interface ModalOptions {
  width?: number | "auto";
  height?: number | "auto";
  disableClose?: boolean; // close when the background is clicked
}

// ********************
// DATA
// ********************

export type ModalData =
  | ModalShareData
  | ModalConfirmData
  | ModalReportData
  | ModalImageData
  | ModalUploadProfilePictureData;

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

export interface ModalUploadProfilePictureData {
  profilePictureSrc?: string; // Your current profile picture
}

// ********************
// RESULTS
// ********************

export type ModalResult = ModalConfirmResult | ModalUploadProfilePictureResult;

export enum ModalConfirmResultTypes {
  CONFIRM = "CONFIRM",
  CANCEL = "CANCEL",
}
export interface ModalConfirmResult {
  status: ModalConfirmResultTypes;
}

export interface ModalUploadProfilePictureResult {
  profilePictureSrc: string;
}
