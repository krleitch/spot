import { Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer, merge } from 'rxjs';
import { takeUntil, mapTo, finalize, takeWhile, startWith } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { SocialStoreNotificationsActions, SocialStoreSelectors } from '@store/social-store';
import { Notification, GetNotificationsRequest, DeleteAllNotificationsRequest,
          SetAllNotificationsSeenRequest } from '@models/notifications';
import { STRINGS } from '@assets/strings/en';
import { NOTIFICATIONS_CONSTANTS } from '@constants/notifications';


@Component({
  selector: 'spot-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.MAIN.NOTIFICATIONS;

  // Notifications state variables
  notifications$: Observable<Notification[]>;
  notifications: Notification[];
  notificationsLoading$: Observable<boolean>;
  notificationsSuccess$: Observable<boolean>;
  loading = false;
  initialLoad = true;
  showNotificationsIndicator$: Observable<boolean>;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    this.notificationsLoading$ = this.store$.pipe(
      select(SocialStoreSelectors.selectGetNotificationsLoading)
    );

    this.notificationsLoading$.pipe(takeUntil(this.onDestroy)).subscribe( (loading: boolean) => {
      this.loading = loading;
      if ( this.loading ) {
        this.showNotificationsIndicator$ = timer(500).pipe( mapTo(true), takeWhile( (_) => this.loading )).pipe( startWith(false) );
      }
    });

    this.notificationsSuccess$ = this.store$.pipe(
      select(SocialStoreSelectors.selectGetNotificationsSuccess)
    );

    this.notifications$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureNotifications)
    );

    // Get last date that was loaded
    this.notifications$.pipe(takeUntil(this.onDestroy)).subscribe( (notifications: Notification[]) => {
      this.notifications = notifications;
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  onScroll() {

    if ( !this.loading ) {

      const request: GetNotificationsRequest = {
        date: this.notifications.length > 0 ? this.notifications.slice(-1).pop().creation_date : new Date().toString(),
        limit: NOTIFICATIONS_CONSTANTS.LIMIT,
        initialLoad: this.initialLoad
      };

      // load the notifications
      this.store$.dispatch(
        new SocialStoreNotificationsActions.GetNotificationsAction(request)
      );

      this.initialLoad = false;

    }

  }

  // Currently unused
  clearAll() {

    const request: DeleteAllNotificationsRequest = {};

    this.store$.dispatch(
      new SocialStoreNotificationsActions.DeleteAllNotificationsAction(request)
    );

  }

  seeAll() {

    const request: SetAllNotificationsSeenRequest = {};

    this.store$.dispatch(
      new SocialStoreNotificationsActions.SetAllNotificationsSeenAction(request)
    );

  }

}
