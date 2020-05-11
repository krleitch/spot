import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'spot-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  @Input() size: string;

  constructor() { }

  ngOnInit() {
  }

  getClass() {
    return 'spinner ' + this.size;
  }

}
