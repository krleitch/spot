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
import { Subject, Observable } from 'rxjs';

// TODO: lazy load components
// Components
import { ShareComponent } from '@src/app/components/main/social/share/share.component';
import { ReportComponent } from '@src/app/components/main/social/report/report.component';
import { ConfirmComponent } from '@src/app/components/helpers/confirm/confirm.component';
import { ImageComponent } from '@src/app/components/helpers/image/image.component';
import { TermsComponent } from '@src/app/components/pre-auth/terms/terms.component';
import { AuthModalComponent } from '@src/app/components/pre-auth/auth-modal/auth-modal.component';
import { WelcomeComponent } from '@src/app/components/main/welcome/welcome.component';
import { UploadPhotoComponent } from '@src/app/components/helpers/upload-photo/upload-photo.component';
import { ChatCreateComponent } from '@src/app/components/main/chat/chat-create/chat-create.component';
import { AccountEditComponent } from '@src/app/components/main/account-edit/account-edit.component'

// Services
import { ModalService } from '@services/modal.service';

// Modals
import { ModalResult, ModalOptions, ModalComponents } from '@models/modal';

@Component({
  selector: 'spot-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() width: number | 'auto';
  @Input() height: number | 'auto';
  @Input() disableClose: boolean;
  @Input() darkenBackground: boolean;
  @Input() hideModals: boolean;
  @Input() componentName: string;

  // All modals must have data and modalId properties
  componentRef: ComponentRef<
    | ShareComponent
    | ReportComponent
    | ConfirmComponent
    | ImageComponent
    | TermsComponent
    | AuthModalComponent
    | WelcomeComponent
    | UploadPhotoComponent
    | ChatCreateComponent
    | AccountEditComponent
  >;

  // Element used for clicking and closing background
  private element;
  // The container to dynamically add content to
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  componentsMapping: {
    [key in ModalComponents]:
      | typeof ShareComponent
      | typeof ReportComponent
      | typeof ConfirmComponent
      | typeof ImageComponent
      | typeof TermsComponent
      | typeof AuthModalComponent
      | typeof WelcomeComponent
      | typeof UploadPhotoComponent
      | typeof ChatCreateComponent
      | typeof AccountEditComponent;
  } = {
    share: ShareComponent,
    report: ReportComponent,
    confirm: ConfirmComponent,
    image: ImageComponent,
    terms: TermsComponent,
    auth: AuthModalComponent,
    welcome: WelcomeComponent,
    uploadPhoto: UploadPhotoComponent,
    chatCreate: ChatCreateComponent,
    accountEdit: AccountEditComponent
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

  setOptions(options: ModalOptions) {
    // Set the options or reset to the default since reusing modal is possible
    if (options) {
      this.width = Object.prototype.hasOwnProperty.call(options, 'width')
        ? options.width
        : 400;
      this.height = Object.prototype.hasOwnProperty.call(options, 'height')
        ? options.height
        : 'auto';
      this.disableClose = Object.prototype.hasOwnProperty.call(
        options,
        'disableClose'
      )
        ? options.disableClose
        : false;
      this.darkenBackground = Object.prototype.hasOwnProperty.call(
        options,
        'darkenBackground'
      )
        ? options.darkenBackground
        : true;
      this.hideModals = Object.prototype.hasOwnProperty.call(
        options,
        'hideModals'
      )
        ? options.hideModals
        : false;
    } else {
      // defaults
      this.width = 400;
      this.height = 'auto';
      this.disableClose = false;
      this.darkenBackground = true;
      this.hideModals = false;
    }
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

  hide(): void {
    this.element.style.display = 'none';
  }

  show(): void {
    this.element.style.display = 'block';
  }

  setResult(result: ModalResult): void {
    this.result.next(result);
  }
}
