import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

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
  data$: Observable<any>;
  data: { message: string } = null;

  @ViewChild('body') body: ElementRef;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.data$ = this.modalService.getData(this.modalId);

    // scroll to top on every open
    this.data$.subscribe((val) => {
      this.scrollToTop();
    });
  }

  scrollToTop(): void {
    if (this.body) {
      this.body.nativeElement.scrollTop = 0;
    }
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
