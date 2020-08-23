import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreNotificationsActions } from '@store/social-store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { AddNotificationRequest } from '@models/notifications';
import { Friend, GetFriendsRequest } from '@models/friends';
import { ModalService } from '@services/modal.service';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit, AfterViewInit {

  @Input() modalId;

  @ViewChild('usernameinput') usernameinput: ElementRef;

  STRINGS = STRINGS.MAIN.SHARE;

  data$: Observable<any>;
  data: { postLink: string } = { postLink: null };

  friends$: Observable<Friend[]>;

  username: string;

  link: string;

  constructor(private store$: Store<RootStoreState.State>, private modalService: ModalService) { }

  ngOnInit() {

    // setup observables

    this.data$ = this.modalService.getData(this.modalId);

    this.data$.subscribe( (val) => {
      this.data.postLink = val;
      this.link = window.location.origin + '/posts/' + this.data.postLink;
    });

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    // Since these buttons are hidden by default we need to call to parse them
    // todo pass in element so not parse entire page
    // TODO
    // window['FB'].XFBML.parse();
    // window['twttr'].widgets.load();

  }

  ngAfterViewInit() {
    // window['FB'].XFBML.parse();
    // window['twttr'].widgets.load();
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
