import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'spot-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @Input() size: string;
  @Input() type?: string; // dot or default
  @Input() light?: boolean; // color the background white, so it can be visible on grey backgrounds

  constructor() {}

  ngOnInit(): void {
    if (typeof this.light === 'undefined') {
      this.light = false;
    }
    if (typeof this.type === 'undefined') {
      this.type = 'default';
    }
  }

  getClass(): string {
    if (this.type === 'dot') {
      return 'dot-pulse';
    } else {
      return 'spinner ' + this.size;
    }
  }
}
