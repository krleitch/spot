import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

import { ModalService } from '@services/modal.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'spot-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {

  @Input() id: string;
  @Input() width: number;
  @Input() height: number;
  @Input() disableClose: boolean;
  private element: any;

  isOpen: boolean;

  data = new Subject<any>();
  result: Subject<any>;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit() {

    const modal = this;

    if (!this.id) {
        return;
    }

    document.body.appendChild(this.element);

    this.element.addEventListener('click', (e: any) => {
        if (e.target.className === 'spot-modal' && !this.disableClose ) {
            modal.close();
        }
    });

    this.modalService.add(this);

  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  open(): void {
    this.element.style.display = 'block';
    document.body.classList.add('spot-modal-open');

    this.isOpen = true;
    this.result = new Subject<any>();

  }

  close(): void {
    this.element.style.display = 'none';
    document.body.classList.remove('spot-modal-open');

    this.isOpen = false;
    if ( this.result ) {
      this.result.complete();
    }

  }

  setResult(result: any) {
    this.result.next(result);
  }

}
