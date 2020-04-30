import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {

  @Input() id: string;
  @Input() width: number;
  @Input() height: number;
  private element: any;

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
        if (e.target.className === 'spot-modal') {
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
    }

    close(): void {
      this.element.style.display = 'none';
      document.body.classList.remove('spot-modal-open');
    }

}
