import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// services
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  @Input() modalId: string;

  data: { message: string } = null;

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
