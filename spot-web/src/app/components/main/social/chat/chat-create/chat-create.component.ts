import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// Models
import { ModalUploadProfilePictureResult, ModalImageData } from '@models/modal';

@Component({
  selector: 'spot-chat-create',
  templateUrl: './chat-create.component.html',
  styleUrls: ['./chat-create.component.scss']
})
export class ChatCreateComponent implements OnInit {
  // Modal properties
  data: ModalImageData;
  modalId: string;

  form: FormGroup;
  errorMessage: string;
  buttonsDisabled = false;
  createLoading = false;

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private modalService: ModalService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {}

  createRoom(): void {
    this.createLoading = true;
    this.buttonsDisabled = true;
  }

  openPhotoModal(): void {
    this.modalService
      .open(
        'create-chat-photo',
        'uploadPhoto',
        {
          profilePictureSrc: 'op.png'
        },
        { darkenBackground: false, disableClose: true }
      )
      .pipe(take(1))
      .subscribe((result: ModalUploadProfilePictureResult) => {
        console.log('got result');
      });
  }

  close(): void {}
}
