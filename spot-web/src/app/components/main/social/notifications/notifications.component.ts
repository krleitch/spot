import { Component, OnInit, OnDestroy } from '@angular/core';

// Rxjs
import { Observable, Subject, timer, merge } from 'rxjs';
import { takeUntil, mapTo, finalize, takeWhile, startWith } from 'rxjs/operators';

// Store
import { RootStoreState } from '@store';
import { SocialStoreNotificationsActions, SocialStoreSelectors } from '@store/social-store';
import { select, Store } from '@ngrx/store';

// Assets
import { STRINGS } from '@assets/strings/en';
import { NOTIFICATIONS_CONSTANTS } from '@constants/notifications';
import { Notification, GetNotificationsRequest, DeleteAllNotificationsRequest,
          SetAllNotificationsSeenRequest,
          GetNotificationsSuccess} from '@models/notifications';
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
  notificationsAfter: null;
  loading = false;
  initialLoad = true;
  showNotificationsIndicator$: Observable<boolean>;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit(): void {

    this.notificationsLoading$ = this.store$.pipe(
      select(SocialStoreSelectors.selectNotificationsLoading)
    );

    this.notificationsLoading$.pipe(takeUntil(this.onDestroy)).subscribe( (loading: boolean) => {
      this.loading = loading;
      if ( this.loading ) {
        this.showNotificationsIndicator$ = timer(500).pipe( mapTo(true), takeWhile( (_) => this.loading )).pipe( startWith(false) );
      }
    });

    this.notificationsSuccess$ = this.store$.pipe(
      select(SocialStoreSelectors.selectNotificationsSuccess)
    );

    this.notifications$ = this.store$.pipe(
      select(SocialStoreSelectors.selectNotifications)
    );

    // Get last date that was loaded
    this.notifications$.pipe(takeUntil(this.onDestroy)).subscribe( (notifications: Notification[]) => {
      this.notifications = notifications;
    });

    // on successful notifications
    this.notificationsSuccess$.pipe(takeUntil(this.onDestroy)).subscribe( (success: boolean) => {
      this.initialLoad = false;
    });

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  onScroll(): void {

    if ( !this.loading ) {

      const request: GetNotificationsRequest = {
        initialLoad: this.initialLoad,
        after: this.notifications.length > 0 ? this.notifications[this.notifications.length - 1].creation_date : null,
        limit: NOTIFICATIONS_CONSTANTS.LIMIT,
      };

      // load the notifications
      this.store$.dispatch(
        new SocialStoreNotificationsActions.GetNotificationsAction(request)
      );

    }

  }

  // Currently unused
  clearAll(): void {

    const request: DeleteAllNotificationsRequest = {};

    this.store$.dispatch(
      new SocialStoreNotificationsActions.DeleteAllNotificationsAction(request)
    );

  }

  seeAll(): void {

    const request: SetAllNotificationsSeenRequest = {};

    this.store$.dispatch(
      new SocialStoreNotificationsActions.SetAllNotificationsSeenAction(request)
    );

  }

}
