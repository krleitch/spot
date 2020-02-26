import { Component, OnInit, Input } from '@angular/core';
import { Notification } from '@models/notifications';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { SocialStoreActions } from '@store/social-store';
import { SetNotificationSeenRequest } from '@models/notifications';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {

  @Input() notification: Notification;

  STRINGS = STRINGS.MAIN.NOTIFICATION_ITEM;

  constructor(private router: Router, private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    console.log(this.notification);

  }

  getTime(date: string) {
    const curTime = new Date();
    const postTime = new Date(date);
    const timeDiff = curTime.getTime() - postTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff / 1000);
      if (secDiff === 0) {
        return 'Now';
      } else {
        return secDiff + 's';
      }
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff / 60000);
      return minDiff + 'm';
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      return hourDiff + 'h';
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      return dayDiff + 'd';
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      return yearDiff + 'y';
    }
  }

  goToPost() {

    const request: SetNotificationSeenRequest = {
      notificationId: this.notification.id
    };

    // set seen
    this.store$.dispatch(
      new SocialStoreActions.SetNotificationSeenAction(request)
    );

    this.router.navigateByUrl(/posts/ + this.notification.post_id);
  }

  getPreview(content: string) {
    return content.substr(0, 20) + '...';
  }

}
