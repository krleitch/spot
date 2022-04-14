import { Component, OnInit } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

// models
import { ModalData } from '@models/modal';

@Component({
  selector: 'spot-chat-discover',
  templateUrl: './chat-discover.component.html',
  styleUrls: ['./chat-discover.component.scss']
})
export class ChatDiscoverComponent implements OnInit {
  // Modal properties
  data: ModalData;
  modalId: string;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  close(): void {
    this.modalService.close(this.modalId);
  }
}
