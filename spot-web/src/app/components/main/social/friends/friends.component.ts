import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { STRINGS } from '@assets/strings/en';
import { FriendRequest, GetFriendRequestsRequest, AddFriendRequestsRequest,
          AcceptFriendRequestsRequest, DeclineFriendRequestsRequest, Friend, GetFriendsRequest } from '@models/friends';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  STRINGS = STRINGS.MAIN.FRIENDS;

  friendRequests$: Observable<FriendRequest[]>;
  friends$: Observable<Friend[]>;
  friendRequestUsername: string;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    // setup observables
    this.friendRequests$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriendRequests)
    );

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    // get friends and friend requests
    const friendRequestsRequest: GetFriendRequestsRequest = {};

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendRequestsAction(friendRequestsRequest)
    );

    const friendRequest: GetFriendsRequest = {};

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendsAction(friendRequest)
    );

  }

  addFriendRequest() {

    const request: AddFriendRequestsRequest = {
      username: this.friendRequestUsername
    };

    // accept
    this.store$.dispatch(
      new SocialStoreFriendsActions.AddFriendRequestsAction(request)
    );

  }

  acceptFriendRequest(id: string) {

    const request: AcceptFriendRequestsRequest = {
      friendRequestId: id
    };

    // accept
    this.store$.dispatch(
      new SocialStoreFriendsActions.AcceptFriendRequestsAction(request)
    );

  }

  declineFriendRequest(id: string) {

    const request: DeclineFriendRequestsRequest = {
      friendRequestId: id
    };

    // decline
    this.store$.dispatch(
      new SocialStoreFriendsActions.DeclineFriendRequestsAction(request)
    );

  }

}
