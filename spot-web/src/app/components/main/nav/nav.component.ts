import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subject, timer } from 'rxjs';
import { mapTo, startWith, takeUntil, takeWhile } from 'rxjs/operators';

// store
import { Store, select } from '@ngrx/store';
import { AccountsActions } from '@store/accounts-store';
import {
  SocialStoreNotificationsActions,
  SocialStoreSelectors
} from '@store/social-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';

// services
import { ModalService } from '@services/modal.service';

import { Account, AccountMetadata } from '@models/accounts';
import { GetNotificationsUnreadRequest } from '@models/notifications';

@Component({
  selector: 'spot-main-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  // on title click
  @Output() titleEvent = new EventEmitter<boolean>();

  // account
  @ViewChild('account') accountView;
  accountShowDropdown = false;
  account$: Observable<Account>;
  accountLoading$: Observable<boolean>;
  loading: boolean;
  showAccountIndicator$: Observable<boolean>;
  accountMetadata$: Observable<AccountMetadata>;

  // Auth
  isAuthenticated$: Observable<boolean>;
  isAuthenticated: boolean;

  // notifications
  @ViewChild('notifications') notificationsView;
  unread$: Observable<number>;
  unreadNotifications = '0';
  showNotifications = false;

  constructor(
    private router: Router,
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private ref: ChangeDetectorRef
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {
    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccount)
    );

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.unread$ = this.store$.pipe(
      select(SocialStoreSelectors.selectUnreadNotifications)
    );

    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    this.isAuthenticated$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((isAuthenticated: boolean) => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.ref.markForCheck();

          const request: GetNotificationsUnreadRequest = {};

          this.store$.dispatch(
            new SocialStoreNotificationsActions.GetNotificationsUnreadAction(
              request
            )
          );
        }
      });

    this.unread$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((numberUnread: number) => {
        if (numberUnread >= 10) {
          this.unreadNotifications = '+';
        } else {
          this.unreadNotifications = numberUnread.toString();
        }
      });

    this.accountLoading$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountLoading)
    );

    this.accountLoading$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loading: boolean) => {
        this.loading = loading;
        if (this.loading) {
          this.showAccountIndicator$ = timer(1000)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.loading)
            )
            .pipe(startWith(false));
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent): void {
    // Hide the dropdown if you click outside
    if (
      this.accountView &&
      !this.accountView.nativeElement.contains(event.target)
    ) {
      this.accountSetDropdown(false);
    }

    if (
      this.notificationsView &&
      !this.notificationsView.nativeElement.contains(event.target)
    ) {
      this.showNotifications = false;
    }
  }

  accountSetDropdown(value: boolean): void {
    this.accountShowDropdown = value;
  }

  logout(): void {
    this.store$.dispatch(new AccountsActions.LogoutRequestAction());
  }

  navigateHome(): void {
    // Bring to landing  if not logged in
    if (!this.isAuthenticated) {
      this.router.navigateByUrl('/');
      return;
    }

    // Bring back to home or scroll up in home
    if (this.router.url === '/home') {
      this.titleEvent.emit(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigateByUrl('/home');
    }
  }

  openAuthModal(): void {
    this.modalService.open('global', 'auth');
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
}
