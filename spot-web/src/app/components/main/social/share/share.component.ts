import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, throwError } from 'rxjs';
import { map, takeUntil, catchError } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { AddNotificationRequest, AddNotificationSuccess } from '@models/notifications';
import { SpotError } from '@exceptions/error';
import { Friend } from '@models/friends';
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';
import { NotificationsService } from '@services/notifications.service';

import { STRINGS } from '@assets/strings/en';

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

  @Input() modalId;

  @ViewChild('usernameinput') usernameinput: ElementRef;
  @ViewChild('social') social: ElementRef;

  STRINGS = STRINGS.MAIN.SHARE;

  data$: Observable<any>;
  data: { postId: string, postLink: string, commentId?: string, commentLink?: string } = { postId: null, postLink: null };

  isAuthenticated: boolean;
  friends$: Observable<ShareFriend[]>;
  friends: ShareFriend[];

  username: string;
  errorMessage: string;
  successMessage: string;

  link: string;
  twitterButtonCreated = false;

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService,
              private modalService: ModalService,
              private notificationsService: NotificationsService) { }

  ngOnInit() {

    this.isAuthenticated = this.authenticationService.isAuthenticated();

    this.data$ = this.modalService.getData(this.modalId);

    this.data$.subscribe( (val) => {
      this.data = val;
      this.link = window.location.origin + '/posts/' + this.data.postLink;
      if ( this.data.commentLink ) {
        this.link += '/comments/' + this.data.commentLink;
      }
    });

    // Add a sent property to the list of friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends),
    ).pipe(
      map( (friends: Friend[]) => {
        return friends.map( (friend: Friend) => {
          return {
            ...friend,
            sent: false,
          };
        });
      }),
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe( (friends: ShareFriend[]) => {
      this.friends = friends;
    });

  }

  ngAfterViewInit() {
    // whenever the modal is opened and becomes visible
    this.observer = new IntersectionObserver(([entry]) => {

      if ( entry.isIntersecting ) {

        // reset some state
        this.errorMessage = '';
        this.successMessage = '';

        this.friends.forEach( (friend: ShareFriend) => {
          friend.sent = false;
        });

        // parse the links
        if ( window['FB'] ) {
          window['FB'].XFBML.parse(this.social.nativeElement);
        }
        if ( window['twttr'] ) {
          if ( !this.twitterButtonCreated ) {
            window['twttr'].widgets.createShareButton(
              `https://twitter.com/share?url=${this.link}`,
              this.social.nativeElement,
              {
                size: "large",
                text: "Spotted",
                hashtags: "spot",
                via: "spot"
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

  ngOnDestroy() {
    this.onDestroy.next();
  }

  closeShare() {
    this.modalService.close(this.modalId);
  }

  sendNotification() {

    this.errorMessage = '';
    this.successMessage = '';

    // username is required
    if ( !this.username ) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      return;
    }

    // Check if they are your friend
    if ( this.friends.find( (friend: Friend) =>  friend.username === this.username ) === undefined ) {
      this.errorMessage = this.STRINGS.FRIEND_ERROR;
      return;
    }

    let request: AddNotificationRequest;

    if ( this.data.commentId ) {
      request = {
        receiver: this.username,
        postId: this.data.postId,
        commentId: this.data.commentId
      };
    } else {
      request = {
        receiver: this.username,
        postId: this.data.postId
      };
    }

    // send the request
    this.notificationsService.addNotification(request).pipe(
      takeUntil(this.onDestroy),
      catchError( errorResponse => {
        return throwError(errorResponse.error);
      }),
    ).subscribe( (response: AddNotificationSuccess ) => {
      this.successMessage = this.STRINGS.SUCCESS;
    }, ( error: SpotError ) => {
      this.errorMessage = error.message;
    });

  }

  sendNotificationToFriend(username: string) {

    this.errorMessage = '';
    this.successMessage = '';

    let request: AddNotificationRequest;

    if ( this.data.commentId ) {
      request = {
        receiver: username,
        postId: this.data.postId,
        commentId: this.data.commentId
      };
    } else {
      request = {
        receiver: username,
        postId: this.data.postId
      };
    }

    // send the request
    this.notificationsService.addNotification(request).pipe(
      takeUntil(this.onDestroy),
      catchError( errorResponse => {
        return throwError(errorResponse.error);
      }),
    ).subscribe( (response: AddNotificationSuccess ) => {
      // none
    }, ( error: SpotError ) => {
      // none
    });

  }

  copyLink() {
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
  }

}
