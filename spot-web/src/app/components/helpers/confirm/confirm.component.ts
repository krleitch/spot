import { Component, OnInit } from '@angular/core';

// services
import { ModalService } from '@services/modal.service';

// models
import {
  ModalConfirmData,
  ModalConfirmResult,
  ModalConfirmResultTypes
} from '@models/modal';

@Component({
  selector: 'spot-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  // MODAL
  modalId: string;
  data: ModalConfirmData = { message: null };

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  cancel(): void {
    const result: ModalConfirmResult = {
      status: ModalConfirmResultTypes.CANCEL
    };
    this.modalService.setResult(this.modalId, result);
    this.modalService.close(this.modalId);
  }

  confirm(): void {
    const result: ModalConfirmResult = {
      status: ModalConfirmResultTypes.CONFIRM
    };
    this.modalService.setResult(this.modalId, result);
    this.modalService.close(this.modalId);
  }
}
