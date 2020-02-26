import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { SocialStoreActions } from '@store/social-store';
import { AddNotificationRequest } from '@models/notifications';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  @Input() postId;

  STRINGS = STRINGS.MAIN.SHARE;

  username: string;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
  }

  sendNotification() {

    const request: AddNotificationRequest = {
      receiver: this.username,
      postId: this.postId
    };

    // send the notification
    this.store$.dispatch(
      new SocialStoreActions.AddNotificationAction(request)
    );

  }

}
