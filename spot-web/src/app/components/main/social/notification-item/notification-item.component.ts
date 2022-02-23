import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { SocialStoreNotificationsActions } from '@store/social-store';

// assets
import { Notification } from '@models/notifications';
import {
  DeleteNotificationRequest,
  SetNotificationSeenRequest
} from '@models/notifications';
import { UserMetadata } from '@models/../newModels/userMetadata';

@Component({
  selector: 'spot-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  @ViewChild('notificationImage') notificationImage: ElementRef;

  @Input() notification: Notification;
  imageBlurred: boolean;
  time: string;

  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  constructor(
    private router: Router,
    private store$: Store<RootStoreState.State>
  ) {}

  ngOnInit(): void {
    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((userMetadata: UserMetadata) => {
        this.userMetadata = userMetadata;
      });

    if (this.notification.reply_image_src)
      this.imageBlurred = this.notification.reply_image_nsfw;
    else if (this.notification.comment_image_src) {
      this.imageBlurred = this.notification.comment_image_nsfw;
    } else if (this.notification.image_src) {
      this.imageBlurred = this.notification.image_nsfw;
    } else {
      this.imageBlurred = false;
    }

    this.time = this.getTime();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  getTime(): string {
    const curTime = new Date();
    const notificationTime = new Date(this.notification.creation_date);
    const timeDiff = curTime.getTime() - notificationTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff / 1000);
      if (secDiff <= 0) {
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

  goToPost(event: any): void {
    // if you click on image that is blurred then don't go to post, unblur it
    if (
      this.notificationImage.nativeElement.contains(event.target) &&
      this.imageBlurred
    ) {
      this.imageBlurred = false;
      return;
    }

    if (!this.notification.seen) {
      const request: SetNotificationSeenRequest = {
        notificationId: this.notification.id
      };

      // set seen
      this.store$.dispatch(
        new SocialStoreNotificationsActions.SetNotificationSeenAction(request)
      );
    }

    if (this.notification.reply_link) {
      this.router.navigateByUrl(
        '/posts/' +
          this.notification.link +
          '/comments/' +
          this.notification.reply_link
      );
    } else if (this.notification.comment_link) {
      this.router.navigateByUrl(
        '/posts/' +
          this.notification.link +
          '/comments/' +
          this.notification.comment_link
      );
    } else {
      this.router.navigateByUrl('/posts/' + this.notification.link);
    }
  }

  delete(): void {
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

  imageClicked(): void {
    this.imageBlurred = false;
  }
}
