import { Component, OnInit } from '@angular/core';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.PASSWORD_RESET;

  constructor() { }

  ngOnInit() {
  }

}
