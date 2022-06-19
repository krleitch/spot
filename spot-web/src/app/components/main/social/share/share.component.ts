import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// rxjs
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { UserStoreSelectors, RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { ModalService } from '@services/modal.service';
import { NotificationService } from '@src/app/services/notification.service';
import { AlertService } from '@services/alert.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  NotificationType
} from '@models/notification';
import { Friend } from '@models/friend';
import { SpotError } from '@exceptions/error';
import { ModalShareData } from '@models/modal';

// has the friend been sent a notification
interface ShareFriend extends Friend {
  sent: boolean;
}

@Component({
  selector: 'spot-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();
  private observer: IntersectionObserver;

  // MODAL
  modalId: string;
  data: ModalShareData = { spot: null };

  // The container holding the social media buttons that need to be rendered
  @ViewChild('social') social: ElementRef;

  STRINGS: Record<string, string>;

  authenticated$: Observable<boolean>;
  authenticated: boolean;
  friends$: Observable<ShareFriend[]>;
  friends: ShareFriend[];

  username: string;
  errorMessage: string;
  successMessage: string;

  link: string;
  twitterButtonCreated = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private alertService: AlertService,
    private TranslateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    // Is the user authenticated
    this.authenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    this.authenticated$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((authenticated: boolean) => {
        this.authenticated = authenticated;
      });

    // Add a sent property to the list of friends
    this.friends$ = this.store$
      .pipe(select(SocialStoreSelectors.selectFriends))
      .pipe(
        map((friends: Friend[]) => {
          return friends.map((friend: Friend) => {
            return {
              ...friend,
              sent: false
            };
          });
        })
      );

    this.friends$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((friends: ShareFriend[]) => {
        this.friends = friends;
      });

    this.link = window.location.origin + '/spot/' + this.data.spot.link;
    if (this.data.comment) {
      this.link += '/comment/' + this.data.comment.link;
    }

    this.TranslateService.get('MAIN.SHARE').subscribe((strings: Record<string, string>) => {
      this.STRINGS = strings;
    });
  }

  ngAfterViewInit(): void {
    // whenever the modal is opened and becomes visible
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // reset some state
        this.errorMessage = '';
        this.successMessage = '';

        this.friends.forEach((friend: ShareFriend) => {
          friend.sent = false;
        });

        // parse the links
        if (window['FB']) {
          window['FB'].XFBML.parse(this.social.nativeElement);
        }
        if (window['twttr']) {
          if (!this.twitterButtonCreated) {
            window['twttr'].widgets.createShareButton(
              `https://twitter.com/share?url=${this.link}`,
              this.social.nativeElement,
              {
                size: 'large',
                text: 'Spotted',
                hashtags: 'spot',
                via: 'spot'
              }
            );
            this.twitterButtonCreated = true;
          }
          window['twttr'].widgets.load(this.social.nativeElement);
        }
      }
    });
    this.observer.observe(this.social.nativeElement);
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  closeShare(): void {
    this.modalService.close('global');
  }

  sendNotification(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // username is required
    if (!this.username) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      return;
    }

    // Check if they are your friend
    if (
      this.friends.find(
        (friend: Friend) => friend.username === this.username
      ) === undefined
    ) {
      this.errorMessage = this.STRINGS.FRIEND_ERROR;
      return;
    }

    let request: CreateNotificationRequest;

    if (this.data.comment) {
      request = {
        receiver: this.username,
        spotId: this.data.spot.spotId,
        commentId: this.data.comment.commentId,
        content: this.data.comment.content.substring(0, 255),
        type: NotificationType.SHARE
      };
    } else {
      request = {
        receiver: this.username,
        spotId: this.data.spot.spotId,
        content: this.data.spot.content.substring(0, 255),
        type: NotificationType.SHARE
      };
    }

    // send the request
    this.notificationService
      .createTagNotification(request)
      .pipe(
        takeUntil(this.onDestroy),
        catchError((errorResponse) => {
          return throwError(errorResponse.error);
        })
      )
      .subscribe(
        (_response: CreateNotificationResponse) => {
          this.successMessage = this.STRINGS.SUCCESS + request.receiver;
        },
        (errorResponse: { error: SpotError }) => {
          this.errorMessage = errorResponse.error.message;
        }
      );
  }

  sendNotificationToFriend(username: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    let request: CreateNotificationRequest;

    if (this.data.comment) {
      request = {
        receiver: username,
        spotId: this.data.spot.spotId,
        commentId: this.data.comment.commentId,
        content: this.data.comment.content.substring(0, 255),
        type: NotificationType.SHARE
      };
    } else {
      request = {
        receiver: username,
        spotId: this.data.spot.spotId,
        content: this.data.spot.content.substring(0, 255),
        type: NotificationType.SHARE
      };
    }

    // send the request
    this.notificationService
      .createTagNotification(request)
      .pipe(
        takeUntil(this.onDestroy),
        catchError((errorResponse) => {
          return throwError(errorResponse.error);
        })
      )
      .subscribe(
        (_response: CreateNotificationResponse) => {
          // none
        },
        (_errorResponse: { error: SpotError }) => {
          // none
        }
      );
  }

  copyLink(): void {
    // create an element to copy from
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.link;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    // message
    this.alertService.success(this.STRINGS.COPY_LINK_SUCCESS);
  }

  getDisplayName(name: string): string {
    if (name.length) {
      return name[0].toUpperCase();
    } else {
      return '';
    }
  }
}
