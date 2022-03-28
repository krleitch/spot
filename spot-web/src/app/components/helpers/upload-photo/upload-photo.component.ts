import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { take } from 'rxjs/operators';
import { Buffer } from 'buffer';

// Services
import { ModalService } from '@services/modal.service';
import { UserService } from '@services/user.service';

// Models
import {
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
  DeleteProfilePictureRequest,
  DeleteProfilePictureResponse
} from '@models/image';
import { ModalUploadPhotoData, ModalUploadPhotoResult } from '@models/modal';
@Component({
  selector: 'spot-upload-photo',
  templateUrl: './upload-photo.component.html',
  styleUrls: ['./upload-photo.component.scss']
})
export class UploadPhotoComponent implements OnInit, AfterViewInit {
  // Modal properties
  modalId: string;
  // imageSrc is your current photo
  data: ModalUploadPhotoData = { type: undefined, imageSrc: undefined };

  // Cropper properties
  @ViewChild('cropper') imageCropper: ElementRef<HTMLElement>;
  imageShow = false;
  isMouseDown = false;
  imageChangedEvent = '';
  croppedImage = '';
  transform = {
    scale: 1,
    translateH: 0,
    translateV: 0
  };

  // Status flags
  uploadLoading = false;
  errorUploading = false;
  confirmRemove = false;
  removeLoading = false;
  errorRemoving = false;

  constructor(
    private modalService: ModalService,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.imageCropper.nativeElement.addEventListener('mousedown', (_e) => {
      this.isMouseDown = true;
    });
    this.imageCropper.nativeElement.addEventListener('mouseup', (_e) => {
      this.isMouseDown = false;
    });
    this.imageCropper.nativeElement.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const rect = this.imageCropper.nativeElement.getBoundingClientRect();
        const offsetX = e.x - rect.left;
        const offsetY = e.y - rect.top;
        if (offsetX < 15) {
          // left
          this.transform = {
            ...this.transform,
            translateH: this.transform.translateH + 5
          };
        } else if (offsetX > rect.width - 15) {
          // right
          this.transform = {
            ...this.transform,
            translateH: this.transform.translateH - 5
          };
        } else if (offsetY < 15) {
          // up
          this.transform = {
            ...this.transform,
            translateV: this.transform.translateV + 5
          };
        } else if (offsetY > rect.height - 15) {
          // down
          this.transform = {
            ...this.transform,
            translateV: this.transform.translateV - 5
          };
        }
      }
    });
  }

  fileChangeEvent(event: string): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded(_image: LoadedImage) {
    // show cropper
    this.imageShow = true;
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
    this.imageShow = false;
  }

  scaleUp(): void {
    this.transform = {
      ...this.transform,
      scale: this.transform.scale + 1
    };
  }

  scaleDown(): void {
    this.transform = {
      ...this.transform,
      scale: Math.max(this.transform.scale - 1, 1)
    };
  }

  reset(): void {
    this.transform = {
      scale: 1,
      translateH: 0,
      translateV: 0
    };
  }

  dataUrlToFile(dataUrl: string, filename: string): File | null {
    const arr = dataUrl.split(',');
    if (arr.length < 2) {
      return null;
    }
    const mimeArr = arr[0].match(/:(.*?);/);
    if (!mimeArr || mimeArr.length < 2) {
      return null;
    }
    const mime = mimeArr[1];
    const buff = Buffer.from(arr[1], 'base64');
    return new File([buff], filename, { type: mime });
  }

  confirm(): void {
    if (this.uploadLoading || this.removeLoading) {
      return;
    }

    this.errorUploading = false;
    this.confirmRemove = false;
    this.uploadLoading = true;
    if (this.data.type === 'profile-picture') {
      const file = this.dataUrlToFile(this.croppedImage, 'photo');
      const request: UploadProfilePictureRequest = {
        image: file
      };
      this.userService
        .uploadProfilePicture(request)
        .pipe(take(1))
        .subscribe(
          (response: UploadProfilePictureResponse) => {
            this.uploadLoading = false;
            const result: ModalUploadPhotoResult = {
              imageSrc: response.user.profilePictureSrc
            };
            this.modalService.setResult(this.modalId, result);
            this.close();
          },
          (_err) => {
            this.uploadLoading = false;
            this.errorUploading = true;
          }
        );
    } else if (this.data.type === 'create-chat') {
      let result: ModalUploadPhotoResult;
      if (!this.croppedImage && !this.data.imageSrc) {
        result = {};
      } else if (this.croppedImage) {
        const file = this.dataUrlToFile(this.croppedImage, 'photo');
        result = {
          image: file
        };
      } else {
        // We still have the data.imageSrc so create-chat shouldnt delete it
        result = {
          image: null
        };
      }
      this.uploadLoading = false;
      this.errorUploading = true;
      this.modalService.setResult(this.modalId, result);
      this.close();
    }
  }

  remove(): void {
    if (this.uploadLoading || this.removeLoading) {
      return;
    }
    // Remove the cropped image if it exists first
    if (this.croppedImage) {
      this.croppedImage = '';
      return;
    }
    if (this.data.type === 'create-chat' && this.data.imageSrc) {
      this.data.imageSrc = undefined;
      return;
    }
    // Show confirm message first
    if (!this.confirmRemove && this.data.type !== 'create-chat') {
      // We dont need to confirm for create-chat since nothing to delete
      this.confirmRemove = true;
    } else {
      this.errorRemoving = false;
      this.confirmRemove = false;
      this.removeLoading = true;
      if (this.data.type === 'profile-picture') {
        const request: DeleteProfilePictureRequest = {};
        this.userService
          .deleteProfilePicture(request)
          .pipe(take(1))
          .subscribe(
            (_response: DeleteProfilePictureResponse) => {
              this.removeLoading = false;
              const result: ModalUploadPhotoResult = {
                imageSrc: undefined
              };
              this.modalService.setResult(this.modalId, result);
              this.close();
            },
            (_err) => {
              this.removeLoading = false;
              this.errorRemoving = true;
            }
          );
      } else if (this.data.type === 'create-chat') {
        this.removeLoading = false;
        // We have nothing to remove if we are still creating the chat
        // No image has been uploaded yet
      }
      // TODO: update-chat
    }
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
