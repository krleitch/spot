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
  // name = '';
  // description = '';

  errorMessage: string;
  createLoading = false;
  // Is the chat open to others, or invite only
  isPublic = true;

  constructor(
    private chatService: ChatService,
    private modalService: ModalService
  ) {
    this.createChatForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(63),
        forbiddenNameValidator(/bob/i)
      ]),
      description: new FormControl('', [Validators.maxLength(255)])
    });
  }

  ngOnInit(): void {}

  get name() {
    return this.createChatForm.get('name');
  }
  get description() {
    return this.createChatForm.get('description');
  }

  createRoom(): void {}

  openPhotoModal(): void {
    this.modalService
      .open(
        'create-chat-photo',
        'uploadPhoto',
        {
          type: 'create-chat',
          imageSrc: undefined
        },
        { darkenBackground: false, disableClose: true }
      )
      .pipe(take(1))
      .subscribe((result: ModalUploadPhotoResult) => {
        console.log('got result');
      });
  }

  toggleIsPublic() {
    this.isPublic = !this.isPublic;
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
