import { Component, OnInit, Input } from '@angular/core';

// Services
import { ModalService } from '@services/modal.service';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.TERMS;

  @Input() modalId: string;

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {

  }

  close(): void {
    this.modalService.close(this.modalId);
  }

}
