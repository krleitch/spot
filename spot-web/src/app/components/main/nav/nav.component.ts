import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { STRINGS } from '@assets/strings/en';

import { AccountsActions } from '@store/accounts-store';
import { RootStoreState } from '@store';

@Component({
  selector: 'spot-main-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  STRINGS = STRINGS.MAIN.NAV;

  @ViewChild('account') accountView;
  accountShowDropdown = false;

  constructor(private router: Router, private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

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

  account() {
    this.router.navigateByUrl('/account');
  }

}
