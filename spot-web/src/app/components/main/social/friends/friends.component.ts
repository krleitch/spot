import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { AccountsFacebookActions, AccountsStoreSelectors } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';
import { FriendRequest, GetFriendRequestsRequest, AddFriendRequestsRequest,
          AcceptFriendRequestsRequest, DeclineFriendRequestsRequest, Friend,
          GetFriendsRequest, DeleteFriendsRequest } from '@models/friends';
import { FacebookConnectRequest } from '@models/accounts';
import { SpotError } from '@exceptions/error';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  STRINGS = STRINGS.MAIN.FRIENDS;

  friendRequests$: Observable<FriendRequest[]>;
  friends$: Observable<Friend[]>;
  friendsError$: Observable<SpotError>;
  facebookConnected$: Observable<boolean>;
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

    this.friendsError$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriendsError)
    );

    this.facebookConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectFacebookConnected)
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

  deleteFriendRequest(id: string) {

    const request: DeleteFriendsRequest = {
      friendId: id
    };

    // delete
    this.store$.dispatch(
      new SocialStoreFriendsActions.DeleteFriendsAction(request)
    );

  }

  facebookConnect() {

    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
          window['FB'].login((loginResponse) => {
            if (loginResponse.status === 'connected') {

                // localStorage.removeItem('fb_access_token');
                // localStorage.removeItem('fb_expires_in');

                const request: FacebookConnectRequest = {
                  accessToken: loginResponse.authResponse.accessToken
                };

                this.store$.dispatch(
                  new AccountsFacebookActions.FacebookConnectRequestAction(request)
                );

            } else {
              // could not login
              // TODO some error msg
            }
          })
      } else {
        // already logged in
        // this.router.navigateByUrl('/home');
        // TODO THIS // ALSO LANDING
        window['FB'].logout();
      }
    });

  }

}
