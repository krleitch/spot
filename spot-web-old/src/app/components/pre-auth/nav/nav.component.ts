import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.NAV;

  constructor(private router: Router) { }

  ngOnInit() { }

  home() {
    this.router.navigateByUrl('/');
  }

  about() {
    this.router.navigateByUrl('/about');
  }

  contact() {
    this.router.navigateByUrl('/contact');
  }

}
