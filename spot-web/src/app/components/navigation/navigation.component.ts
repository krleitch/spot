import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { AccountsStoreSelectors, RootStoreState } from '../../root-store';
import { AccountsActions } from '@store';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  currentTab: string;
  loggedIn$: Observable<boolean>;

  constructor(private router: Router, private location: Location,
              private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    this.loggedIn$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectMyFeatureLoggedIn)
    );

    this.currentTab = this.location.path().substr(1);
  }

  selected(tab) {
    return tab === this.currentTab;
  }

  select(tab) {
    this.currentTab = tab
  }

  home() {
    this.select('home');
    this.router.navigateByUrl('/home');
  }

  settings() {
    this.select('settings');
  }

  global() {
    this.select('global');
  }

  account() {
    this.select('account');
    this.router.navigateByUrl('/account');
  }

  login() {
    this.select('login');
    this.router.navigateByUrl('/login');
  }

  logout() {
    this.store$.dispatch(
      new AccountsActions.LogoutRequestAction()
    );
  }

}
