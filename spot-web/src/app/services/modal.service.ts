import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

// Models
import { ModalOptions, ModalData } from '@models/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: any[] = [];

  constructor() {}

  add(modal: any) {
    this.modals.push(modal);
  }

  remove(id: string) {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  open(
    id: string,
    componentName: string,
    data?: ModalData,
    options?: ModalOptions
  ): Observable<any> {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.setComponent(componentName);
    if (data) {
      modal.componentRef.instance.data = data;
    }
    modal.componentRef.instance.modalId = id;
    if (options) {
      modal.width = options.width ? options.width : 400;
      modal.height = options.height ? options.height : 'auto';
      modal.disabledClose = options.disableClose ? options.disableClose : false;
    } else {
      // reset
      modal.width = 400;
      modal.height = 'auto';
      modal.disableClose = false;
    }
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

  setResult(id: string, result: any) {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.setResult(result);
  }

}
