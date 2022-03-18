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
export class UploadPhotoComponent implements OnInit, AfterViewInit {
  modalId: string;
  data: ModalUploadProfilePictureData = { profilePictureSrc: undefined }; // Your current profile picture
  @ViewChild('cropper') imageCropper: ElementRef<HTMLElement>;
  isMouseDown = false;
  confirmRemove = false;

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
            translateH: this.transform.translateH - 5
          };
        } else if (offsetX > rect.width - 15) {
          // right
          this.transform = {
            ...this.transform,
            translateH: this.transform.translateH + 5
          };
        } else if (offsetY < 15) {
          // up
          this.transform = {
            ...this.transform,
            translateV: this.transform.translateV - 5
          };
        } else if (offsetY > rect.height - 15) {
          // down
          this.transform = {
            ...this.transform,
            translateV: this.transform.translateV + 5
          };
        }
      }
    });
  }

  imageChangedEvent = '';
  croppedImage = '';
  errorUploading = false;
  loading = false;
  transform = {
    scale: 1,
    translateH: 0,
    translateV: 0
  };

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

  scaleUp() {
    this.transform = {
      ...this.transform,
      scale: this.transform.scale + 1
    };
  }

  scaleDown() {
    this.transform = {
      ...this.transform,
      scale: Math.max(this.transform.scale - 1, 0)
    };
  }

  reset() {
    this.transform = {
      scale: 1,
      translateH: 0,
      translateV: 0
    };
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
    this.confirmRemove = false;
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

  showConfirmRemove() {
    this.confirmRemove = true;
  }

  remove() {
    this.errorUploading = false;
    this.confirmRemove = false;
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
