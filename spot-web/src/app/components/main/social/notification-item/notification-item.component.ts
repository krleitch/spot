import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { SocialStoreNotificationsActions } from '@store/social-store';

// assets
import { Notification } from '@models/notifications';
import { SetNotificationSeenRequest, DeleteNotificationRequest } from '@models/notifications';
import { AccountMetadata } from '@models/accounts';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @Input() notification: Notification;
  imageBlurred: boolean;

  accountMetadata$: Observable<AccountMetadata>;
  accountMetadata: AccountMetadata;

  STRINGS = STRINGS.MAIN.NOTIFICATION_ITEM;

  constructor(private router: Router, private store$: Store<RootStoreState.State>) { }

  ngOnInit() { 

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.accountMetadata$.pipe(takeUntil(this.onDestroy)).subscribe( (accountMetadata: AccountMetadata) => {
      this.accountMetadata = accountMetadata;
    });

    if ( this.notification.reply_image_src )
      this.imageBlurred = this.notification.reply_image_nsfw;
    else if ( this.notification.comment_image_src ) {
      this.imageBlurred = this.notification.comment_image_nsfw;
    } else if ( this.notification.image_src )  {
      this.imageBlurred = this.notification.image_nsfw;
    } else {
      this.imageBlurred = false;
    }

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
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
      new SocialStoreNotificationsActions.SetNotificationSeenAction(request)
    );

    if ( this.notification.comment_link ) {
      this.router.navigateByUrl('/posts/' + this.notification.link + '/comments/' + this.notification.comment_link);
    } else {
      this.router.navigateByUrl('/posts/' + this.notification.link);
    }

  }

  delete() {

    const request: DeleteNotificationRequest = {
      notificationId: this.notification.id
    };

    // delete the notification
    this.store$.dispatch(
      new SocialStoreNotificationsActions.DeleteNotificationAction(request)
    );

  }

  getImagePreview(notification: Notification): string {
    return notification.username[0].toUpperCase();
  }

}
