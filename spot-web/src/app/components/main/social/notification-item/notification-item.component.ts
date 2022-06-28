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
import { SocialStoreNotificationActions } from '@store/social-store';

// assets
import {
  Notification,
  DeleteNotificationRequest,
  SetNotificationSeenRequest
} from '@models/notification';
import { UserMetadata } from '@models/userMetadata';

@Component({
  selector: 'spot-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  @ViewChild('notificationImage') notificationImage: ElementRef;

  @Input() notification: Notification;
  time: string;

  // image
  imageSrc: string; // prioritizes reply/comment/spot
  imageNsfw: boolean;
  imageBlurred: boolean;

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


    this.time = this.getTime();

    // source the image if it exists
    this.imageSrc = this.notification.replyImageSrc
      ? this.notification.replyImageSrc
      : this.notification.commentImageSrc
      ? this.notification.commentImageSrc
      : this.notification.imageSrc
      ? this.notification.imageSrc
      : null;
    this.imageNsfw = this.notification.replyImageNsfw
      ? this.notification.replyImageNsfw
      : this.notification.commentImageNsfw
      ? this.notification.commentImageNsfw
      : this.notification.imageNsfw
      ? this.notification.imageNsfw
      : null;

    if (this.notification.replyImageSrc)
      this.imageBlurred = this.notification.replyImageNsfw;
    else if (this.notification.commentImageSrc) {
      this.imageBlurred = this.notification.commentImageNsfw;
    } else if (this.notification.imageSrc) {
      this.imageBlurred = this.notification.imageNsfw;
    } else {
      this.imageBlurred = false;
    }

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  getTime(): string {
    const curTime = new Date();
    const notificationTime = new Date(this.notification.createdAt);
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
      this.notificationImage && 
      this.notificationImage.nativeElement.contains(event.target) &&
      this.imageBlurred
    ) {
      this.imageBlurred = false;
      return;
    }

    if (!this.notification.seen) {
      const request: SetNotificationSeenRequest = {
        notificationId: this.notification.notificationId
      };

      // set seen
      this.store$.dispatch(
        new SocialStoreNotificationActions.SetNotificationSeenAction(request)
      );
    }

    if (this.notification.replyLink) {
      this.router.navigateByUrl(
        '/spot/' +
          this.notification.link +
          '/comment/' +
          this.notification.replyLink
      );
    } else if (this.notification.commentLink) {
      this.router.navigateByUrl(
        '/spot/' +
          this.notification.link +
          '/comment/' +
          this.notification.commentLink
      );
    } else {
      this.router.navigateByUrl('/spot/' + this.notification.link);
    }
  }

  delete(): void {
    const request: DeleteNotificationRequest = {
      notificationId: this.notification.notificationId
    };

    // delete the notification
    this.store$.dispatch(
      new SocialStoreNotificationActions.DeleteNotificationAction(request)
    );
  }

  getImagePreview(notification: Notification): string {
    return notification.username[0].toUpperCase();
  }

  imageClicked(): void {
    this.imageBlurred = false;
  }
}
