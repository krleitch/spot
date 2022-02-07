import {
  Component,
  ComponentRef,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

// Components
import { ShareComponent } from '@src/app/components/main/social/share/share.component';

// services
import { ModalService } from '@services/modal.service';

// rxjs
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

  @Input() componentName: string;
  componentRef: ComponentRef<unknown>;

  private element: any;

  // The container to dynamically add content to
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  componentsMapping = {
    share: ShareComponent
  };

  isOpen: boolean;

  data = new Subject<any>();
  result: Subject<any>;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    if (!this.id) {
      return;
    }

    document.body.appendChild(this.element);

    this.element.addEventListener('click', (e: any) => {
      if (e.target.className === 'spot-modal' && !this.disableClose) {
        this.close();
      }
    });

    this.modalService.add(this);
  }

  setComponent(componentName: string): void {
    const component = this.componentsMapping[componentName];
    this.componentRef = this.container.createComponent(component);
  }

  removeComponent(): void {
    this.container.clear();
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
    if (this.result) {
      this.result.complete();
    }
  }

  setResult(result: any): void {
    this.result.next(result);
  }
}
