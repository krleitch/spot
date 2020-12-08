import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'spot-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  @Input() size: string;
  @Input() light?: boolean; // color the background white, so it can be visible on grey backgrounds

  constructor() { }

  ngOnInit(): void {
    if ( typeof(this.light) === 'undefined' ) {
      this.light = false;
    }
  }

  getClass(): string {
    return 'spinner ' + this.size;
  }

}
