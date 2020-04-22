import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @Output() close = new EventEmitter<boolean>();

  STRINGS = STRINGS.MAIN.REPORT;

  constructor() { }

  ngOnInit() {
  }

  closeReport() {
    this.close.emit(true);
  }

}
