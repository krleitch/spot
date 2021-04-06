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

  routeIsLogin(): boolean {
    return this.router.url === '/login';
  }

  isSelected(name: string): boolean {
    return this.router.url === '/' + name;
  }

}
