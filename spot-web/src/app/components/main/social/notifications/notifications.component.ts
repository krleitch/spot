import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreNotificationsActions, SocialStoreSelectors } from '@store/social-store';
import { Notification, GetNotificationsRequest, DeleteAllNotificationsRequest,
          SetAllNotificationsSeenRequest } from '@models/notifications';
import { STRINGS } from '@assets/strings/en';


@Component({
  selector: 'spot-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  STRINGS = STRINGS.MAIN.NOTIFICATIONS;

  notificationsLoaded = 0;
  loadLimit = 10;
  initialLoad = false;

  notifications$: Observable<Notification[]>;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    this.notifications$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureNotifications)
    );

  }

  onScroll() {

    const request: GetNotificationsRequest = {
      offset: this.notificationsLoaded,
      limit: this.loadLimit
    };

    // load the notifications
    this.store$.dispatch(
      new SocialStoreNotificationsActions.GetNotificationsAction(request)
    );

    this.notificationsLoaded += this.loadLimit;

  }

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
