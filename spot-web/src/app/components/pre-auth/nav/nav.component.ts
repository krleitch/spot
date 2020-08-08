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

  login() {
    this.router.navigateByUrl('/login');
  }

  register() {
    this.router.navigateByUrl('/register');
  }

  routeIsLogin(): boolean {
    return this.router.url === '/login';
  }

}
