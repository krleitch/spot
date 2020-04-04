import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreNotificationsActions } from '@store/social-store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { AddNotificationRequest } from '@models/notifications';
import { Friend, GetFriendsRequest } from '@models/friends';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  @Input() postLink;
  @Output() close = new EventEmitter<boolean>();

  STRINGS = STRINGS.MAIN.SHARE;

  friends$: Observable<Friend[]>;

  username: string;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    // setup observables
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    const friendRequest: GetFriendsRequest = {};

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendsAction(friendRequest)
    );

  }

  sendNotification() {

    const request: AddNotificationRequest = {
      receiver: this.username,
      postLink: this.postLink
    };

    // send the notification
    this.store$.dispatch(
      new SocialStoreNotificationsActions.AddNotificationAction(request)
    );

  }

  sendNotificationToFriend(username: string) {

    const request: AddNotificationRequest = {
      receiver: username,
      postLink: this.postLink
    };

    // send the notification
    this.store$.dispatch(
      new SocialStoreNotificationsActions.AddNotificationAction(request)
    );

  }

  closeShare() {
    this.close.emit(true);
  }

  copyLink() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = window.location.origin + '/posts/' + this.postLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

}
