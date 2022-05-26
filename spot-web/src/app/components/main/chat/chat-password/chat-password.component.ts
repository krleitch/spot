import { Component, OnInit } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-chat-password',
  templateUrl: './chat-password.component.html',
  styleUrls: ['./chat-password.component.scss']
})
export class ChatPasswordComponent implements OnInit {
  modalId: string;
  data: any;

  // state
  password: string;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  join(): void {
    this.modalService.setResult(this.modalId, { password: this.password });
    this.close();
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
