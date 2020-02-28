import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreActions, SocialStoreSelectors } from '@store/social-store';
import { Notification, GetNotificationsRequest, DeleteAllNotificationsRequest } from '@models/notifications';
import { STRINGS } from '@assets/strings/en';


@Component({
  selector: 'spot-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  STRINGS = STRINGS.MAIN.NOTIFICATIONS;

  notifications$: Observable<Notification[]>;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    this.notifications$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureNotifications)
    );

    const request: GetNotificationsRequest = {};

    // load the notifications
    this.store$.dispatch(
      new SocialStoreActions.GetNotificationsAction(request)
    );

  }

  clearAll() {

    const request: DeleteAllNotificationsRequest = {};

    this.store$.dispatch(
      new SocialStoreActions.DeleteAllNotificationsAction(request)
    );

  }

}
