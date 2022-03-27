import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// Models
import { ModalUploadPhotoResult, ModalData } from '@models/modal';

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
  isPublic = true;
  // Image
  image: File;
  imageSrc: string;

  constructor(
    private chatService: ChatService,
    private modalService: ModalService
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
      console.log('submit form');
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
        if (result.image) {
          this.processPhoto(result.image);
        } else if (result.image === undefined) {
          this.image = null;
          this.imageSrc = '';
        }
      });
  }

  toggleIsPublic() {
    this.isPublic = !this.isPublic;
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
