import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'spot-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

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
