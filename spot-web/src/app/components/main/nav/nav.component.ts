import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { STRINGS } from '@assets/strings/en';
import { AccountsActions } from '@store/accounts-store';
import { SocialStoreSelectors, SocialStoreActions } from '@store/social-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { Account } from '@models/accounts';
import { Notification, GetNotificationsRequest } from '@models/notifications';

@Component({
  selector: 'spot-main-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  STRINGS = STRINGS.MAIN.NAV;

  account$: Observable<Account>;
  notifications$: Observable<Notification[]>;
  unreadNotifications = '0';

  @ViewChild('account') accountView;
  @ViewChild('notifications') notificationsView;
  accountShowDropdown = false;
  showNotifications = false;

  constructor(private router: Router, private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.notifications$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureNotifications)
    );

    const request: GetNotificationsRequest = {};

    // load the notifications
    this.store$.dispatch(
      new SocialStoreActions.GetNotificationsAction(request)
    );

    this.notifications$.subscribe( (notifs: Notification[]) => {
      let unread = 0;
      notifs.forEach( (n: Notification) => {
        if (n.seen === 0) {
          unread += 1;
        }
      });
      if (unread >= 10) {
        this.unreadNotifications = '+';
      } else {
        this.unreadNotifications = unread.toString();
      }
    });

  }

  offClickHandler(event: MouseEvent) {
    // Hide the dropdown if you click outside
    if (!this.accountView.nativeElement.contains(event.target)) {
      this.accountSetDropdown(false);
    }

    if (!this.notificationsView.nativeElement.contains(event.target)) {
      this.showNotifications = false;
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
