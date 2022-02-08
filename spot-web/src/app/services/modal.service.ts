import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

// Models
import { ModalOptions, ModalData, ModalResult } from '@models/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: any[] = [];

  constructor() {}

  // On modal init register it
  add(modal: any) {
    this.modals.push(modal);
  }

  // On modal destruction, remove it
  remove(id: string) {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  open(
    id: string,
    componentName: string,
    data?: ModalData,
    options?: ModalOptions
  ): Observable<ModalResult> {
    // Get the modal and set the component
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.setComponent(componentName);

    // IMPORTANT
    // All modals should have the data and modalId properties
    if (data) {
      modal.componentRef.instance.data = data;
    }
    modal.componentRef.instance.modalId = id;

    // Set the options or reset to the default since reusing modal is possible
    if (options) {
      modal.width = options.width ? options.width : 400;
      modal.height = options.height ? options.height : 'auto';
      modal.disabledClose = options.disableClose ? options.disableClose : false;
    } else {
      modal.width = 400;
      modal.height = 'auto';
      modal.disableClose = false;
    }

    // Open the modal, return the result observable
    return modal.open();
  }

  isOpen(id: string): boolean {
    return this.modals.filter((x) => x.id === id)[0].isOpen;
  }

  close(id: string) {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.close();
  }

  closeAll() {
    this.modals.forEach((modal) => {
      modal.close();
    });
  }

  setResult(id: string, result: ModalResult) {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.setResult(result);
  }
}
