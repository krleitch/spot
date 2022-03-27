import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Models
import {
  ModalOptions,
  ModalData,
  ModalResult,
  ModalComponents
} from '@models/modal';

// Components
import { ModalComponent } from '@src/app/components/helpers/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: ModalComponent[] = [];

  constructor() {}

  // On modal init register it
  add(modal: ModalComponent) {
    this.modals.push(modal);
  }
  // On modal destruction, remove it
  remove(id: string) {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  // Open the modal
  open(
    id: string,
    componentName: ModalComponents,
    data?: ModalData,
    options?: ModalOptions
  ): Observable<ModalResult> {
    // Get the modal and set the component
    const found: ModalComponent[] = this.modals.filter((x) => x.id === id);
    if (found.length === 0) {
      return;
    }
    const modal = found[0];
    modal.setComponent(componentName);

    // IMPORTANT
    // All modals should have the data and modalId properties
    if (data) {
      modal.componentRef.instance.data = data;
    } else {
      modal.componentRef.instance.data = {};
    }
    modal.componentRef.instance.modalId = id;

    // Set new options or make default
    modal.setOptions(options);
    if (options && options.hideModals) {
      this.hideAll(modal.id);
    }
    // Open the modal, return the result observable
    return modal.open();
  }

  isOpen(id: string): boolean {
    const modal = this.modals.filter((x) => x.id === id);
    if (modal.length > 0) {
      return modal[0].isOpen;
    }
  }

  close(id: string): void {
    const modal = this.modals.filter((x) => x.id === id);
    if (modal.length > 0) {
      // If the modal was hiding others, than show the others
      // Hide modals only works for one modal on top of another currently
      // TODO: fix for multiple
      if (modal[0].hideModals) {
        this.showAll(modal[0].id);
      }
      modal[0].close();
    }
  }

  closeAll(): void {
    this.modals.forEach((modal) => {
      modal.close();
    });
  }

  hideAll(id: string): void {
    // Dont hide the modal which is still being shown
    this.modals.forEach((modal) => {
      if (modal.id !== id) {
        modal.hide();
      }
    });
  }

  showAll(id: string): void {
    // Dont show the modal that was never hidden
    this.modals.forEach((modal) => {
      if (modal.id !== id) {
        modal.show();
      }
    });
  }

  setResult(id: string, result: ModalResult): void {
    const modal = this.modals.filter((x) => x.id === id);
    if (modal.length > 0) {
      modal[0].setResult(result);
    }
  }
}
