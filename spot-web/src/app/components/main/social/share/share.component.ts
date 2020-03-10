import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

  @Input() postLink;
  @Output() close = new EventEmitter<boolean>();

  STRINGS = STRINGS.MAIN.SHARE;

  username: string;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
  }

  sendNotification() {

    const request: AddNotificationRequest = {
      receiver: this.username,
      postLink: this.postLink
    };

    // send the notification
    this.store$.dispatch(
      new SocialStoreActions.AddNotificationAction(request)
    );

  }

  closeShare() {
    this.close.emit(true);
  }

  copyLink() {
    // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    // probably create text area hidden and copy its contents??
  }

}
