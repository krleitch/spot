
export interface ModalOptions {
    width?: number | 'auto';
    height?: number | 'auto';
    disableClose?: boolean; // close when the background is clicked
}

export type ModalData = ModalShareData | ModalConfirmData | ModalReportData | ModalImageData;

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

export type ModalResult = ModalConfirmResult | ModalUploadPhotoResult;

export enum ModalConfirmResultTypes {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
}
export interface ModalConfirmResult {
  status: ModalConfirmResultTypes;
}

export interface ModalUploadPhotoResult {
  photo: string;
}