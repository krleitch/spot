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
import { UserActions } from '@src/app/root-store/user-store';
import {
  SocialStoreNotificationActions,
  SocialStoreSelectors
} from '@store/social-store';
import { UserStoreSelectors, RootStoreState } from '@store';

// services
import { ModalService } from '@services/modal.service';

import { User } from '@models/user';
import { UserMetadata } from '@models/userMetadata';
import { GetUnseenNotificationsRequest } from '@models/notification';

@Component({
  selector: 'spot-main-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  // on title click
  @Output() titleEvent = new EventEmitter<boolean>();

  // user
  @ViewChild('user') userView;
  userShowDropdown = false;
  user$: Observable<User>;
  userLoading$: Observable<boolean>;
  loading: boolean;
  showUserIndicator$: Observable<boolean>;
  userMetadata$: Observable<UserMetadata>;

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
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.unread$ = this.store$.pipe(
      select(SocialStoreSelectors.selectTotalUnseenNotifications)
    );

    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    this.isAuthenticated$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((isAuthenticated: boolean) => {
        this.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
          this.ref.markForCheck();

          const request: GetUnseenNotificationsRequest = {};

          this.store$.dispatch(
            new SocialStoreNotificationActions.GetUnseenNotificationsAction(
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

    this.userLoading$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserLoading)
    );

    this.userLoading$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loading: boolean) => {
        this.loading = loading;
        if (this.loading) {
          this.showUserIndicator$ = timer(1000)
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
    if (this.userView && !this.userView.nativeElement.contains(event.target)) {
      this.userSetDropdown(false);
    }

    if (
      this.notificationsView &&
      !this.notificationsView.nativeElement.contains(event.target)
    ) {
      this.showNotifications = false;
    }
  }

  userSetDropdown(value: boolean): void {
    this.userShowDropdown = value;
  }

  logout(): void {
    this.store$.dispatch(new UserActions.LogoutRequestAction());
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
