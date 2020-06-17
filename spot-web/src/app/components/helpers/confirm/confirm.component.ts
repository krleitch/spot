import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { ModalService } from '@services/modal.service';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  STRINGS = STRINGS.MAIN.CONFIRM;

  @Input() modalId: string;

  data$: Observable<any>;
  data: any;

  constructor(private modalService: ModalService) { }

  ngOnInit() {

    this.data$ = this.modalService.getData(this.modalId);

    this.data$.subscribe( (val) => {
      this.data = val;
    });

  }

  cancel() {
    this.modalService.setResult(this.modalId, { status: 'cancel' });
    this.modalService.close(this.modalId);
  }

  confirm() {
    this.modalService.setResult(this.modalId, { status: 'confirm' });
    this.modalService.close(this.modalId);
  }

}
