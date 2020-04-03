import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { STRINGS } from '@assets/strings/en';
import { FriendRequest, GetFriendRequestsRequest, AddFriendRequestsRequest } from '@models/friends';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  STRINGS = STRINGS.MAIN.FRIENDS;

  friendRequests$: Observable<FriendRequest[]>;
  friendRequestUsername: string;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    // setup observable for friend requests
    this.friendRequests$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriendRequests)
    );

    const request: GetFriendRequestsRequest = {};

    // load the friend requests
    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendRequestsAction(request)
    );

  }

  addFriendRequest() {

    const request: AddFriendRequestsRequest = {
      username: this.friendRequestUsername
    };

    // load the friend requests
    this.store$.dispatch(
      new SocialStoreFriendsActions.AddFriendRequestsAction(request)
    );

  }

}
