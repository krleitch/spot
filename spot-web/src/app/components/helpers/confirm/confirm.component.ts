import { Component, Input, OnInit } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

// models
import { ModalConfirmData } from '@models/modal';

@Component({
  selector: 'spot-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  
  modalId: string;
  data: ModalConfirmData = { message: '' };

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  cancel(): void {
    this.modalService.setResult(this.modalId, { status: 'cancel' });
    this.modalService.close(this.modalId);
  }

  confirm(): void {
    this.modalService.setResult(this.modalId, { status: 'confirm' });
    this.modalService.close(this.modalId);
  }
}
