import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  HostListener
} from '@angular/core';
import { Sort } from '@helpers/sort';

@Directive({
  selector: '[spotSort]'
})
export class SortDirective {
  @Input() spotSort: Array<any>;
  constructor(private renderer: Renderer2, private targetElem: ElementRef) {}

  @HostListener('click')
  sortData() {
    const sort = new Sort();
    const elem = this.targetElem.nativeElement;
    const order = elem.getAttribute('data-order');
    const type = elem.getAttribute('data-type');
    const property = elem.getAttribute('data-name');
    if (order === 'desc') {
      this.spotSort.sort(sort.startSort(property, order, type));
      elem.setAttribute('data-order', 'asc');
    } else {
      this.spotSort.sort(sort.startSort(property, order, type));
      elem.setAttribute('data-order', 'desc');
    }
  }
}
