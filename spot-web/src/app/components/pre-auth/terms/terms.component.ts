import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// Services
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  // MODAL
  modalId: string;
  data; // unused

  @ViewChild('body') body: ElementRef;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {}

  scrollToTop(): void {
    if (this.body) {
      this.body.nativeElement.scrollTop = 0;
    }
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
