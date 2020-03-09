import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.USERNAME;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  continue() {
    this.router.navigateByUrl('/home');
  }

}
