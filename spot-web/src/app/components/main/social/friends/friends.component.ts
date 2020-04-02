import { Component, OnInit } from '@angular/core';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  STRINGS = STRINGS.MAIN.FRIENDS;

  constructor() { }

  ngOnInit() {
  }

}
