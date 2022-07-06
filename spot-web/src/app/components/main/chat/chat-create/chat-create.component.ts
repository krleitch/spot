import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { v4 as uuidv4 } from 'uuid';

// store
import { Store, select } from '@ngrx/store';
import { ChatStoreActions } from '@store/chat-store';
import { RootStoreState } from '@store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';

// Services
import { ChatService } from '@services/chat.service';
import { UserService } from '@services/user.service';
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import { ModalUploadPhotoResult, ModalData } from '@models/modal';
import {
  UploadChatRoomPhotoRequest,
  UploadChatRoomPhotoResponse
} from '@models/image';
import { SpotError } from '@exceptions/error';
import {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  AddUserChatRoomStore,
  ChatRoom,
  ChatType,
  AddOpenChatStore
} from '@models/chat';
import { LocationData } from '@models/location';
import { User, UserRole } from '@models/user';

// Validators
import { forbiddenNameValidator } from '@helpers/validators/forbidden-name.directive';
import { validateAllFormFields } from '@helpers/validators/validate-helpers';

@Component({
  selector: 'spot-chat-create',
  templateUrl: './chat-create.component.html',
  styleUrls: ['./chat-create.component.scss']
})
export class ChatCreateComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  // Modal properties
  data: ModalData;
  modalId: string;

  STRINGS: Record<string, string>;

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

  // location
  user$: Observable<User>;
  user: User;
  location$: Observable<LocationData>;
  location: LocationData;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService,
    private userService: UserService,
    private translateService: TranslateService
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
          /^[\w!@#$%^&*()_+-=[\]{};':"\\|,.<>/?+\s$]*$/,
          'allow'
        )
      ]),
      password: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(64),
        forbiddenNameValidator(
          /^[\w!@#$%^&*()_+-=[\]{};':"\\|,.<>/?+\s$]*$/,
          'allow'
        )
      ])
    });
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );
    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));
    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      this.user = user;
    });
    this.translateService
      .get('MAIN.CHAT_CREATE')
      .subscribe((res: Record<string, string>) => {
        this.STRINGS = res;
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  get name() {
    return this.createChatForm.get('name');
  }
  get description() {
    return this.createChatForm.get('description');
  }
  get password() {
    return this.createChatForm.get('password');
  }

  // make sure password is required if isPrivate is true
  passwordRequiredCheck(): boolean {
    return !(this.isPrivate && this.password.value.length === 0);
  }

  createRoom(): void {
    if (this.createChatForm.valid && this.passwordRequiredCheck()) {
      // Upload image first, if it exists
      if (this.image) {
        const uploadRequest: UploadChatRoomPhotoRequest = {
          image: this.image
        };
        this.userService
          .uploadChatRoomPhoto(uploadRequest)
          .pipe(take(1))
          .subscribe(
            (response: UploadChatRoomPhotoResponse) => {
              const chatRequest: CreateChatRoomRequest = {
                name: this.name.value,
                description: this.description.value,
                password: this.isPrivate ? this.password.value : null,
                imageSrc: response.imageSrc,
                lat: this.location.latitude,
                lng: this.location.longitude
              };
              this.chatService
                .createChatRoom(chatRequest)
                .pipe(take(1))
                .subscribe(
                  (response: CreateChatRoomResponse) => {
                    const request: AddUserChatRoomStore = {
                      chatRoom: response.chatRoom
                    };
                    this.store$.dispatch(
                      new ChatStoreActions.AddUserChatRoomStoreAction(request)
                    );
                    this.createRoomTab(response.chatRoom);
                    this.close();
                  },
                  (err) => {
                    if (
                      err.error &&
                      err.error.errors &&
                      Object.prototype.hasOwnProperty.call(
                        err.error.errors,
                        'name'
                      )
                    ) {
                      this.name.setErrors({ taken: true });
                    }
                    if (this.user.role == UserRole.GUEST) {
                      this.errorMessage = this.STRINGS.GUEST_ERROR;
                    }
                  }
                );
            },
            (_err: { error: SpotError }) => {
              this.errorMessage = this.STRINGS.IMAGE_ERROR;
            }
          );
      } else {
        const chatRequest: CreateChatRoomRequest = {
          name: this.name.value,
          description: this.description.value,
          password: this.isPrivate ? this.password.value : null,
          lat: this.location.latitude,
          lng: this.location.longitude
        };
        this.chatService
          .createChatRoom(chatRequest)
          .pipe(take(1))
          .subscribe(
            (response: CreateChatRoomResponse) => {
              const request: AddUserChatRoomStore = {
                chatRoom: response.chatRoom
              };
              this.store$.dispatch(
                new ChatStoreActions.AddUserChatRoomStoreAction(request)
              );
              this.createRoomTab(response.chatRoom);
              this.close();
            },
            (err) => {
              if (
                err.error &&
                err.error.errors &&
                Object.prototype.hasOwnProperty.call(err.error.errors, 'name')
              ) {
                this.name.setErrors({ taken: true });
              }
              console.log(err);
              if (this.user.role == UserRole.GUEST) {
                this.errorMessage = this.STRINGS.GUEST_ERROR;
              }
            }
          );
      }
    } else {
      // set password required
      if (this.isPrivate && this.password.value.length === 0) {
        this.password.setErrors({ required: true });
      }
      validateAllFormFields(this.createChatForm);
    }
  }

  createRoomTab(room: ChatRoom) {
    const newChat: ChatRoom = {
      ...room
    };
    const request: AddOpenChatStore = {
      tab: {
        tabId: uuidv4(),
        type: ChatType.ROOM,
        data: newChat
      }
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
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
          this.image = result.image;
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
