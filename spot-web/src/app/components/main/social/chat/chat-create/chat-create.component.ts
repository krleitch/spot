import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChatService } from '@services/chat.service';

@Component({
  selector: 'spot-chat-create',
  templateUrl: './chat-create.component.html',
  styleUrls: ['./chat-create.component.scss']
})
export class ChatCreateComponent implements OnInit {
  form: FormGroup;
  errorMessage: string;
  buttonsDisabled = false;

  constructor(private fb: FormBuilder, private chatService: ChatService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {}

  createRoom(): void {}

  close(): void {}
}
