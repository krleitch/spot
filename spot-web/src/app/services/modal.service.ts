import { Component, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

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

  open(id: string, componentName: string, data?: any, options?: any) {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.setComponent(componentName);
    if (data) {
      modal.componentRef.instance.data = data;
    }
    if (options) {

      // TODO; Options for welcome, disable close
      // Will need to reset since using same global modal

    }
    modal.open();
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

  getResult(id: string): Observable<any> {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    return modal.result.asObservable();
  }
}
