import { Component, OnInit, Input } from '@angular/core';
import { ModalService } from '@services/modal.service';

import { Observable } from 'rxjs';

@Component({
  selector: 'spot-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  @Input() modalId: string;

  data$: Observable<any>;
  data: any;

  constructor(private modalService: ModalService) { }

  ngOnInit() {

    this.data$ = this.modalService.getData(this.modalId);

    this.data$.subscribe( (val) => {
      console.log(val);
      this.data = val;
    });

  }

  confirm() {
    this.modalService.setResult(this.modalId, 'CONFIRMED');
  }

}
