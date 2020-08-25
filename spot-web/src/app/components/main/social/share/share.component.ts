import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { SocialStoreNotificationsActions } from '@store/social-store';
import { SocialStoreSelectors } from '@store/social-store';
import { AddNotificationRequest } from '@models/notifications';
import { Friend } from '@models/friends';
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly onDestroy = new Subject<void>();

  @Input() modalId;

  @ViewChild('usernameinput') usernameinput: ElementRef;

  STRINGS = STRINGS.MAIN.SHARE;

  data$: Observable<any>;
  data: { postLink: string } = { postLink: null };

  isAuthenticated: boolean;
  friends$: Observable<Friend[]>;

  username: string;

  link: string;

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService,
              private modalService: ModalService) { }

  ngOnInit() {

    // setup observables

    this.isAuthenticated = this.authenticationService.isAuthenticated();

    this.data$ = this.modalService.getData(this.modalId);

    this.data$.subscribe( (val) => {
      this.data.postLink = val;
      this.link = window.location.origin + '/posts/' + this.data.postLink;
    });

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  ngAfterViewInit() {

    this.authenticationService.socialServiceReady.pipe(takeUntil(this.onDestroy)).subscribe( (service: string) => {

      if ( service === 'FB' ) {
        window['FB'].XFBML.parse(document.getElementById('social'));
      }

      if ( service === 'twttr' ) {
        window['twttr'].widgets.load(document.getElementById('social'));
      }

    });

  }

  closeShare() {
    this.modalService.close(this.modalId);
  }

  sendNotification() {

    const request: AddNotificationRequest = {
      receiver: this.username,
      postLink: this.data.postLink
    };

    // send the notification
    this.store$.dispatch(
      new SocialStoreNotificationsActions.AddNotificationAction(request)
    );

  }

  sendNotificationToFriend(username: string) {

    const request: AddNotificationRequest = {
      receiver: username,
      postLink: this.data.postLink
    };

    // send the notification
    this.store$.dispatch(
      new SocialStoreNotificationsActions.AddNotificationAction(request)
    );

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
