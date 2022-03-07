import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
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
import { NotificationsService } from '@services/notifications.service';
import { AlertService } from '@services/alert.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import {
  AddNotificationRequest,
  AddNotificationSuccess
} from '@models/notifications';
import { Friend } from '@models/../newModels/friend';
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
  data: ModalShareData = { spotId: null, spotLink: null };

  @ViewChild('usernameinput') usernameinput: ElementRef;
  @ViewChild('social') social: ElementRef;

  STRINGS;

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
    private notificationsService: NotificationsService,
    private alertService: AlertService,
    private TranslateService: TranslateService
  ) {
    this.TranslateService.get('MAIN.SHARE').subscribe((res: any) => {
      this.STRINGS = res;
    });
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

    this.link = window.location.origin + '/spot/' + this.data.spotLink;
    if (this.data.commentLink) {
      this.link += '/comment/' + this.data.commentLink;
    }
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

    let request: AddNotificationRequest;

    if (this.data.commentId) {
      request = {
        receiver: this.username,
        postId: this.data.spotId,
        commentId: this.data.commentId
      };
    } else {
      request = {
        receiver: this.username,
        postId: this.data.spotId
      };
    }

    // send the request
    this.notificationsService
      .addNotification(request)
      .pipe(
        takeUntil(this.onDestroy),
        catchError((errorResponse) => {
          return throwError(errorResponse.error);
        })
      )
      .subscribe(
        (response: AddNotificationSuccess) => {
          this.successMessage = this.STRINGS.SUCCESS + request.receiver;
        },
        (error: SpotError) => {
          this.errorMessage = error.message;
        }
      );
  }

  sendNotificationToFriend(username: string): void {
    this.errorMessage = '';
    this.successMessage = '';

    let request: AddNotificationRequest;

    if (this.data.commentId) {
      request = {
        receiver: username,
        postId: this.data.spotId,
        commentId: this.data.commentId
      };
    } else {
      request = {
        receiver: username,
        postId: this.data.spotId
      };
    }

    // send the request
    this.notificationsService
      .addNotification(request)
      .pipe(
        takeUntil(this.onDestroy),
        catchError((errorResponse) => {
          return throwError(errorResponse.error);
        })
      )
      .subscribe(
        (response: AddNotificationSuccess) => {
          // none
        },
        (error: SpotError) => {
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
}
