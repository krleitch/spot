import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

// store
import { Store } from '@ngrx/store';
import { ChatStoreActions } from '@store/chat-store';
import { RootStoreState } from '@store';

// Services
import { ChatService } from '@services/chat.service';
import { UserService } from '@services/user.service';
import { ModalService } from '@services/modal.service';

// Models
import { ModalUploadPhotoResult, ModalData } from '@models/modal';
import {
  UploadChatRoomPhotoRequest,
  UploadChatRoomPhotoResponse
} from '@models/image';
import {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  AddChatRoomStore
} from '@models/chat';

// Validators
import { forbiddenNameValidator } from '@helpers/validators/forbidden-name.directive';
import { validateAllFormFields } from '@helpers/validators/validate-helpers';

@Component({
  selector: 'spot-chat-create',
  templateUrl: './chat-create.component.html',
  styleUrls: ['./chat-create.component.scss']
})
export class ChatCreateComponent implements OnInit {
  // Modal properties
  data: ModalData;
  modalId: string;

  // Form
  createChatForm: FormGroup;

  // Status
  errorMessage: string;
  createLoading = false;

  // Is the chat open to others, or invite only
  isPrivate = false;
  // Image
  image: File;
  imageSrc: string;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.createChatForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(64),
        forbiddenNameValidator(
          /^[a-zA-Z][\w!@#$%^&*()_+-=[\]{};':"\\|,.<>/?+\s$]*$/,
          'allow'
        )
      ]),
      description: new FormControl('', [
        Validators.maxLength(256),
        forbiddenNameValidator(
          /^[a-zA-Z]?[\w!@#$%^&*()_+-=[\]{};':"\\|,.<>/?+\s$]*$/,
          'allow'
        )
      ])
    });
  }

  get name() {
    return this.createChatForm.get('name');
  }
  get description() {
    return this.createChatForm.get('description');
  }

  createRoom(): void {
    if (this.createChatForm.valid) {
      // Upload image first, if it exists
      if (this.image) {
        const uploadRequest: UploadChatRoomPhotoRequest = {
          image: this.image
        };
        this.userService
          .uploadChatRoomPhoto(uploadRequest)
          .pipe(take(1))
          .subscribe((response: UploadChatRoomPhotoResponse) => {
            const chatRequest: CreateChatRoomRequest = {
              name: this.name.value,
              description: this.description.value,
              private: this.isPrivate,
              imageSrc: response.imageSrc
            };
            this.chatService
              .createChatRoom(chatRequest)
              .pipe(take(1))
              .subscribe((response: CreateChatRoomResponse) => {
                const request: AddChatRoomStore = {
                  chatRoom: response.chatRoom
                };
                this.store$.dispatch(
                  new ChatStoreActions.AddChatRoomStoreAction(request)
                );
              });
          });
      } else {
        const chatRequest: CreateChatRoomRequest = {
          name: this.name.value,
          description: this.description.value,
          private: this.isPrivate
        };
        this.chatService
          .createChatRoom(chatRequest)
          .pipe(take(1))
          .subscribe((response: CreateChatRoomResponse) => {
            const request: AddChatRoomStore = {
              chatRoom: response.chatRoom
            };
            this.store$.dispatch(
              new ChatStoreActions.AddChatRoomStoreAction(request)
            );
          });
      }
    } else {
      validateAllFormFields(this.createChatForm);
    }
  }

  private processPhoto(file: File): void {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      this.imageSrc = event.target.result.toString();
    });
    reader.readAsDataURL(file);
  }

  openPhotoModal(): void {
    this.modalService
      .open(
        'create-chat-photo',
        'uploadPhoto',
        {
          type: 'create-chat',
          imageSrc: this.imageSrc
        },
        { disableClose: true, hideModals: true }
      )
      .pipe(take(1))
      .subscribe((result: ModalUploadPhotoResult) => {
        // Set the imageSrc
        // If result.image is null then we know the user didnt delete their original image
        if (result.image) {
          this.processPhoto(result.image);
        } else if (result.image === undefined) {
          this.image = null;
          this.imageSrc = '';
        }
      });
  }

  toggleIsPrivate() {
    this.isPrivate = !this.isPrivate;
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
