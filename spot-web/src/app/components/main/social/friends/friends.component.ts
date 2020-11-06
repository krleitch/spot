import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, timer } from 'rxjs';
import { take, takeUntil, mapTo, startWith } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { AccountsFacebookActions, AccountsStoreSelectors } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';
import { FriendRequest, GetFriendRequestsRequest, AddFriendRequestsRequest,
          AcceptFriendRequestsRequest, DeclineFriendRequestsRequest, Friend,
          GetFriendsRequest, DeleteFriendsRequest } from '@models/friends';
import { FacebookConnectRequest } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.MAIN.FRIENDS;

  friendRequests$: Observable<FriendRequest[]>;
  friends$: Observable<Friend[]>;
  friendsError$: Observable<SpotError>;
  friendsError: string;
  facebookConnected$: Observable<boolean>;

  showNoFriendsIndicator$: Observable<boolean>;

  // Input fields
  friendRequestUsername: string;
  friendSearch: string;

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: ModalService) { }

  ngOnInit() {

    // Wait 1 second for data to load
    // TODO: add loading state
    this.showNoFriendsIndicator$ = timer(1000).pipe( mapTo(true), take(1)).pipe( startWith(false) );

    // Setup observables
    this.friendRequests$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriendRequests),
    );

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends),
    );

    this.friendsError$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriendsError),
    );

    this.friendsError$.pipe(takeUntil(this.onDestroy)).subscribe( (error: SpotError) => {
      if ( error ) {
        this.friendsError = error.message;
      }
    });

    this.facebookConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectFacebookConnected),
    );

    // Get all friend requests
    const friendRequestsRequest: GetFriendRequestsRequest = {};

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendRequestsAction(friendRequestsRequest),
    );

    // Get all friends
    const friendRequest: GetFriendsRequest = {
      date: new Date().toString(),
      limit: null,
    };

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendsAction(friendRequest),
    );

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  addFriendRequest() {

    if ( typeof(this.friendRequestUsername) === 'undefined' || this.friendRequestUsername.length === 0 ) {
      this.friendsError = this.STRINGS.USERNAME_REQUIRED;
      return;
    }

    // Send the friend request
    const request: AddFriendRequestsRequest = {
      username: this.friendRequestUsername,
    };

    this.store$.dispatch(
      new SocialStoreFriendsActions.AddFriendRequestsAction(request),
    );

  }

  acceptFriendRequest(id: string) {

    const request: AcceptFriendRequestsRequest = {
      friendRequestId: id,
    };

    // accept
    this.store$.dispatch(
      new SocialStoreFriendsActions.AcceptFriendRequestsAction(request),
    );

  }

  declineFriendRequest(id: string) {

    const request: DeclineFriendRequestsRequest = {
      friendRequestId: id,
    };

    // decline
    this.store$.dispatch(
      new SocialStoreFriendsActions.DeclineFriendRequestsAction(request),
    );

  }

  deleteFriend(id: string) {

    this.modalService.open('spot-confirm-modal');

    const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

    result$.subscribe( (result: { status: string }) => {

      if ( result.status === 'confirm' ) {

        // Delete the friend
        const request: DeleteFriendsRequest = {
          friendId: id,
        };

        this.store$.dispatch(
          new SocialStoreFriendsActions.DeleteFriendsAction(request),
        );

      }

    });

  }

  facebookConnect() {

    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
          window['FB'].login((loginResponse) => {
            if (loginResponse.status === 'connected') {

              const request: FacebookConnectRequest = {
                accessToken: loginResponse.authResponse.accessToken,
              };

              this.store$.dispatch(
                new AccountsFacebookActions.FacebookConnectRequestAction(request),
              );

            }
          });
      } else {
        // Already logged in to facebook
        const request: FacebookConnectRequest = {
          accessToken: statusResponse.authResponse.accessToken,
        };

        this.store$.dispatch(
          new AccountsFacebookActions.FacebookConnectRequestAction(request),
        );
      }
    });

  }

}
