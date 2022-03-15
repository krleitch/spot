import { Component, OnInit } from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { take } from 'rxjs/operators';
import { Buffer } from 'buffer';

// services
import { ModalService } from '@services/modal.service';
import { UserService } from '@services/user.service';

// models
import {
  UpdateProfilePictureRequest,
  UpdateProfilePictureResponse,
  DeleteProfilePictureRequest
} from '@models/user';
import {
  ModalUploadProfilePictureData,
  ModalUploadProfilePictureResult
} from '@models/modal';
@Component({
  selector: 'spot-upload-photo',
  templateUrl: './upload-photo.component.html',
  styleUrls: ['./upload-photo.component.scss']
})
export class UploadPhotoComponent implements OnInit {
  modalId: string;
  data: ModalUploadProfilePictureData = { profilePictureSrc: undefined }; // Your current profile picture

  constructor(
    private modalService: ModalService,
    private userService: UserService
  ) {}

  ngOnInit(): void {}
  imageChangedEvent = '';
  croppedImage = '';
  errorUploading = false;
  loading = false;

  fileChangeEvent(event: string): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(_image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  dataUrlToFile(dataUrl: string, filename: string): File | undefined {
    const arr = dataUrl.split(',');
    if (arr.length < 2) {
      return undefined;
    }
    const mimeArr = arr[0].match(/:(.*?);/);
    if (!mimeArr || mimeArr.length < 2) {
      return undefined;
    }
    const mime = mimeArr[1];
    const buff = Buffer.from(arr[1], 'base64');
    return new File([buff], filename, { type: mime });
  }

  confirm() {
    this.errorUploading = false;
    const file = this.dataUrlToFile(this.croppedImage, 'photo');
    const request: UpdateProfilePictureRequest = {
      image: file
    };
    this.loading = true;

    this.userService
      .updateProfilePicture(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateProfilePictureResponse) => {
          this.loading = false;
          const result: ModalUploadProfilePictureResult = {
            profilePictureSrc: response.user.profilePictureSrc
          };
          this.modalService.setResult(this.modalId, result);
          this.close();
        },
        (_err) => {
          this.loading = false;
          this.errorUploading = true;
        }
      );
  }

  remove() {
    this.errorUploading = false;
    const request: DeleteProfilePictureRequest = {};
    this.loading = true;

    this.userService
      .deleteProfilePicture(request)
      .pipe(take(1))
      .subscribe(
        (_response: UpdateProfilePictureResponse) => {
          this.loading = false;
          const result: ModalUploadProfilePictureResult = {
            profilePictureSrc: undefined
          };
          this.modalService.setResult(this.modalId, result);
          this.close();
        },
        (_err) => {
          this.loading = false;
          this.errorUploading = true;
        }
      );
    this.close();
  }

  close() {
    this.modalService.close(this.modalId);
  }
}
