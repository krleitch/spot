import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer, merge } from 'rxjs';
import { takeUntil, mapTo, takeWhile, startWith } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { AccountsActions } from '@store/accounts-store';
import { SocialStoreSelectors, SocialStoreNotificationsActions } from '@store/social-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { Account, AccountMetadata } from '@models/accounts';
import { GetNotificationsUnreadRequest } from '@models/notifications';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-main-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @Output() titleEvent = new EventEmitter<boolean>();

  STRINGS = STRINGS.MAIN.NAV;

  account$: Observable<Account>;
  accountLoading$: Observable<boolean>;
  loading: boolean;
  showAccountIndicator$: Observable<boolean>;
  accountMetadata$: Observable<AccountMetadata>;
  isAuthenticated$: Observable<boolean>;
  unread$: Observable<number>;
  unreadNotifications = '0';

  @ViewChild('account') accountView;
  @ViewChild('notifications') notificationsView;
  accountShowDropdown = false;
  showNotifications = false;

  constructor(private router: Router,
              private store$: Store<RootStoreState.State>,
              private modalService: ModalService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.unread$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureUnread)
    );

    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    this.isAuthenticated$.pipe(takeUntil(this.onDestroy)).subscribe( (isAuthenticated: boolean) => {
      if (isAuthenticated) {
        const request: GetNotificationsUnreadRequest = {};

        this.store$.dispatch(
          new SocialStoreNotificationsActions.GetNotificationsUnreadAction(request)
        );
      }
    });

    this.unread$.pipe(takeUntil(this.onDestroy)).subscribe( (numberUnread: number) => {
      if (numberUnread >= 10) {
        this.unreadNotifications = '+';
      } else {
        this.unreadNotifications = numberUnread.toString();
      }
    });

    this.accountLoading$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountLoading)
    );

    this.accountLoading$.pipe(takeUntil(this.onDestroy)).subscribe( (loading: boolean) => {
      this.loading = loading;
      if ( this.loading ) {
        this.showAccountIndicator$ = timer(500).pipe( mapTo(true), takeWhile( val => this.loading )).pipe( startWith(false) );
      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent) {
    // Hide the dropdown if you click outside
    if (this.accountView && !this.accountView.nativeElement.contains(event.target)) {
      this.accountSetDropdown(false);
    }

    if (this.notificationsView && !this.notificationsView.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }

  accountSetDropdown(value: boolean) {
    this.accountShowDropdown = value;
  }

  activity() {
    this.router.navigateByUrl('/activity');
  }

  friends() {
    this.router.navigateByUrl('/friends');
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
    if (this.router.url === '/home') {
      this.titleEvent.emit(true);
      const scrollToTop = window.setInterval(() => {
        const pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
    } else {
      this.router.navigateByUrl('/home');
    }
  }

  openAuthModal() {
    this.modalService.open('spot-auth-modal');
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

}
