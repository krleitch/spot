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

// TODO: Can lazy load components here

// Components
import { ShareComponent } from '@src/app/components/main/social/share/share.component';
import { ReportComponent } from '@src/app/components/main/social/report/report.component';
import { ConfirmComponent } from '@src/app/components/helpers/confirm/confirm.component';
import { ImageComponent } from '@src/app/components/helpers/image/image.component';
import { TermsComponent } from '@src/app/components/pre-auth/terms/terms.component';
import { AuthModalComponent } from '@src/app/components/pre-auth/auth-modal/auth-modal.component';
import { WelcomeComponent } from '@src/app/components/main/welcome/welcome.component';
import { UploadPhotoComponent } from '@src/app/components/helpers/upload-photo/upload-photo.component';
import { ChatCreateComponent } from '@src/app/components/main/social/chat/chat-create/chat-create.component';

// services
import { ModalService } from '@services/modal.service';

// rxjs
import { Subject, Observable } from 'rxjs';

// assets
import { ModalResult } from '@models/modal';

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

  private element;

  // The container to dynamically add content to
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  componentsMapping = {
    share: ShareComponent,
    report: ReportComponent,
    confirm: ConfirmComponent,
    image: ImageComponent,
    terms: TermsComponent,
    auth: AuthModalComponent,
    welcome: WelcomeComponent,
    uploadPhoto: UploadPhotoComponent,
    chatCreate: ChatCreateComponent
  };

  isOpen: boolean;
  result: Subject<ModalResult>;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    if (!this.id) {
      return;
    }

    document.body.appendChild(this.element);

    this.element.addEventListener('click', (e) => {
      if (e.target.className === 'spot-modal' && !this.disableClose) {
        this.close();
      }
    });

    this.modalService.add(this);
  }

  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  setComponent(componentName: string): void {
    const component = this.componentsMapping[componentName];
    this.componentRef = this.container.createComponent(component);
  }

  removeComponent(): void {
    this.container.clear();
  }

  open(): Observable<ModalResult> {
    this.element.style.display = 'block';
    document.body.classList.add('spot-modal-open');

    this.isOpen = true;
    this.result = new Subject<ModalResult>();
    return this.result.asObservable();
  }

  close(): void {
    this.element.style.display = 'none';
    document.body.classList.remove('spot-modal-open');

    this.isOpen = false;
    if (this.result) {
      this.result.complete();
    }

    this.removeComponent();
  }

  setResult(result: ModalResult): void {
    this.result.next(result);
  }
}
