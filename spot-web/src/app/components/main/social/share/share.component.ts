import { Component, OnInit } from '@angular/core';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  STRINGS = STRINGS.MAIN.SHARE;

  username: string;

  constructor() { }

  ngOnInit() {
  }

  sendNotification() {
    console.log(this.username);
  }

}
