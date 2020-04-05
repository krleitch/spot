import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('usernameinput') usernameinput: ElementRef;

  STRINGS = STRINGS.MAIN.SHARE;

  friends$: Observable<Friend[]>;
  friendsList: Friend[];
  filteredFriendsList: Friend[];

  username: string;

  link: string;

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

    this.friends$.subscribe ( friends => {
      this.friendsList = friends;
      this.filteredFriendsList = friends;
    });

    // Since these buttons are hidden by default we need to call to parse them
    // todo pass in element so not parse entire page
    window['FB'].XFBML.parse();
    window['twttr'].widgets.load();

    this.link = window.location.origin + '/posts/' + this.postLink;

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

  onUsernameInput(event: any) {
    this.filteredFriendsList = this.friendsList.filter( friend => {
      return friend.username.toUpperCase().indexOf(this.username.toUpperCase()) !== -1;
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
