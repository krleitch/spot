import { Component, OnDestroy, OnInit } from '@angular/core';

// Rxjs
import { Observable, Subject, timer } from 'rxjs';
import { mapTo, skip, startWith, takeUntil, takeWhile } from 'rxjs/operators';

// Store
import { RootStoreState } from '@store';
import {
  SocialStoreNotificationActions,
  SocialStoreSelectors
} from '@store/social-store';
import { Store, select } from '@ngrx/store';

// Assets
import { NOTIFICATIONS_CONSTANTS } from '@constants/notifications';
import {
  DeleteAllNotificationsRequest,
  GetNotificationsRequest,
  Notification,
  SetAllNotificationsSeenRequest
} from '@models/../newModels/notification';
@Component({
  selector: 'spot-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  // Notifications state variables
  notifications$: Observable<Notification[]>;
  notifications: Notification[];
  notificationsLoading$: Observable<boolean>;
  notificationsSuccess$: Observable<boolean>;
  loading = false;
  initialLoad = true;
  showNotificationsIndicator$: Observable<boolean>;

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit(): void {
    // Loading
    this.notificationsLoading$ = this.store$.pipe(
      select(SocialStoreSelectors.selectNotificationsLoading)
    );

    this.notificationsLoading$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loading: boolean) => {
        this.loading = loading;
        if (this.loading) {
          this.showNotificationsIndicator$ = timer(500)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.loading)
            )
            .pipe(startWith(false));
        }
      });

    this.notificationsSuccess$ = this.store$.pipe(
      select(SocialStoreSelectors.selectNotificationsSuccess)
    );

    this.notifications$ = this.store$.pipe(
      select(SocialStoreSelectors.selectNotifications)
    );

    // select notifications
    this.notifications$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((notifications: Notification[]) => {
        this.notifications = notifications;
      });

    // on successful notifications
    this.notificationsSuccess$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe((success: boolean) => {
        if (success) {
          this.initialLoad = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  onScroll(): void {
    if (!this.loading) {
      const request: GetNotificationsRequest = {
        initialLoad: this.notifications.length > 0 ? false : this.initialLoad,
        after: this.initialLoad
          ? null
          : this.notifications.length > 0
          ? this.notifications[
              this.notifications.length - 1
            ].createdAt.toString()
          : null,
        limit: NOTIFICATIONS_CONSTANTS.LIMIT
      };

      // load the notifications
      this.store$.dispatch(
        new SocialStoreNotificationActions.GetNotificationsAction(request)
      );
    }
  }

  // Currently unused
  clearAll(): void {
    const request: DeleteAllNotificationsRequest = {};

    this.store$.dispatch(
      new SocialStoreNotificationActions.DeleteAllNotificationsAction(request)
    );
  }

  seeAll(): void {
    const request: SetAllNotificationsSeenRequest = {};

    this.store$.dispatch(
      new SocialStoreNotificationActions.SetAllNotificationsSeenAction(request)
    );
  }
}
