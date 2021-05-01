import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';

// Services
import { ModalService } from '@services/modal.service';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit, AfterViewInit {

  STRINGS = STRINGS.PRE_AUTH.TERMS;

  @Input() modalId: string;

  @ViewChild('body') body: ElementRef;

  constructor(private modalService: ModalService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.scrollToTop();
  }

  scrollToTop(): void {
    if ( this.body ) {
      console.log('scrolling')
      this.body.nativeElement.scrollTop = 0;
    }
  }

  close(): void {
    this.modalService.close(this.modalId);
  }

}
