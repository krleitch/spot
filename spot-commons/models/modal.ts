
export interface ModalOptions {
    width?: number | 'auto';
    height?: number | 'auto';
    disableClose?: boolean; // close when the background is clicked
}

export type ModalData = ModalShareData | ModalConfirmData | ModalReportData | ModalImageData;

export interface ModalShareData {
  postId: string;
  postLink: string;
  commentId?: string;
  commentLink?: string;
}

export interface ModalConfirmData {
  message: string;
}

export interface ModalReportData {
  postId: string;
  commentId?: string;
}

export interface ModalImageData {
  imageSrc: string;
}

export type ModalResult = ModalConfirmResult;

export enum ModalConfirmResultTypes {
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
}
export interface ModalConfirmResult {
  status: ModalConfirmResultTypes;
}