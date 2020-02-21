import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { STRINGS } from '@assets/strings/en';
import { AccountsActions } from '@store/accounts-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { Account } from '@models/accounts';

@Component({
  selector: 'spot-main-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  STRINGS = STRINGS.MAIN.NAV;

  account$: Observable<Account>;

  showNotifications = false;

  @ViewChild('account') accountView;
  accountShowDropdown = false;

  constructor(private router: Router, private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

  }

  offClickHandler(event: MouseEvent) {
    // Hide the dropdown if you click outside
    if (!this.accountView.nativeElement.contains(event.target)) {
      this.accountSetDropdown(false);
    }
  }

  accountSetDropdown(value: boolean) {
    this.accountShowDropdown = value;
  }

  logout() {
    this.store$.dispatch(
      new AccountsActions.LogoutRequestAction()
    );
  }

  navigateAccount() {
    this.router.navigateByUrl('/account');
  }

  navigateHome() {
    this.router.navigateByUrl('/home');
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

}
