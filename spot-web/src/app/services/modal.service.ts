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

  open(id: string, componentName?: string, data?: any) {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.setComponent(componentName);
    modal.open();

    if (data) {
      modal.data.next(data);
    } else {
      modal.data.next(null);
    }
  }

  isOpen(id: string): boolean {
    return this.modals.filter((x) => x.id === id)[0].isOpen;
  }

  close(id: string) {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.removeComponent();
    modal.close();
  }

  closeAll() {
    this.modals.forEach((modal) => {
      modal.close();
    });
  }

  getData(id: string): Observable<any> {
    const modal: any = this.modals.filter((x) => x.id === id)[0];
    return modal.data.asObservable();
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
