import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, Subject, timer } from 'rxjs';
import { take, mapTo, startWith } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { AccountsFacebookActions, AccountsStoreSelectors } from '@store/accounts-store';

// Services
import { ModalService } from '@services/modal.service';
import { FriendsService } from '@services/friends.service';

// Models
import { GetFriendRequests, Friend, GetFriendRequestsSuccess, AddFriendRequest, AddFriendRequestSuccess,
          GetFriendsRequest, DeleteFriendsRequest, AddFriendToStore, AcceptFriendRequest,
          AcceptFriendRequestSuccess, DeclineFriendRequest, DeclineFriendRequestSuccess, 
          GetPendingFriendRequests, GetPendingFriendRequestsSuccess, DeletePendingFriendRequest, DeletePendingFriendSuccess } from '@models/friends';
import { FacebookConnectRequest } from '@models/accounts';
import { SpotError } from '@exceptions/error';

// Assets
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.MAIN.FRIENDS;

  // Pending
  pendingFriendRequests: Friend[] = [];

  // Requests
  friendRequests: Friend[] = [];
  friendRequestsSuccess: string;
  friendRequestsError: string;

  // Friends
  friends$: Observable<Friend[]>;
  showNoFriendsIndicator$: Observable<boolean>;

  facebookConnected$: Observable<boolean>;

  // Input fields
  friendRequestUsername: string;
  friendSearch: string;

  constructor(private store$: Store<RootStoreState.State>,
              private friendsService: FriendsService,
              private modalService: ModalService) { }

  ngOnInit(): void {

    this.showNoFriendsIndicator$ = timer(1000).pipe( mapTo(true), take(1)).pipe( startWith(false) );

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends),
    );

    this.facebookConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectFacebookConnected),
    );

    // Get all friend requests
    const getFriendRequests: GetFriendRequests = {};

    this.friendsService.getFriendRequests(getFriendRequests).pipe(take(1)).subscribe( (response: GetFriendRequestsSuccess) => {
      this.friendRequests = response.friendRequests;
    }, (error: SpotError) => {

    });

    // Get pending requests
    const getPendingFriendRequests: GetPendingFriendRequests = {};

    this.friendsService.getPendingFriendRequests(getPendingFriendRequests).pipe(take(1)).subscribe( (response: GetPendingFriendRequestsSuccess) => {
      this.pendingFriendRequests = response.friendRequests;
    }, (error: SpotError) => {

    });

    // Get all friends
    const getFriends: GetFriendsRequest = {
      date: new Date().toString(),
      limit: null,
    };

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendsRequestAction(getFriends),
    );

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  addFriendRequest(): void {

    // Reset messages
    this.friendRequestsError = '';
    this.friendRequestsSuccess = '';

    if ( typeof(this.friendRequestUsername) === 'undefined' || this.friendRequestUsername.length === 0 ) {
      this.friendRequestsError = this.STRINGS.USERNAME_REQUIRED;
      return;
    }

    // Send the friend request
    const request: AddFriendRequest = {
      username: this.friendRequestUsername,
    };

    this.friendsService.addFriendRequest(request).pipe(take(1)).subscribe( (response: AddFriendRequestSuccess) => {
      if ( response.friend.confirmed_date ) {
        this.friendRequests.forEach( (friend , i) => {
          if (friend.id === response.friend.id) {
            this.friendRequests.splice(i, 1);
          }
        });
        // friend was added
        const addFriendRequest: AddFriendToStore = {
          friend: response.friend,
        };
        // accept
        this.store$.dispatch(
          new SocialStoreFriendsActions.AddFriendAction(addFriendRequest),
        );
      } else {
        this.pendingFriendRequests.push(response.friend)
      }
    }, (response: {  error: SpotError }) => {
      this.friendRequestsError = response.error.message;
    });

  }

  acceptFriendRequest(id: string): void {

    const request: AcceptFriendRequest = {
      friendRequestId: id,
    };

    this.friendsService.acceptFriendRequests(request).pipe(take(1)).subscribe( (response: AcceptFriendRequestSuccess) => {

      this.friendRequests.forEach( (friend , i) => {
        if (friend.id === response.friend.id) {
          this.friendRequests.splice(i, 1);
        }
      });

      const addFriendRequest: AddFriendToStore = {
        friend: response.friend,
      };

      // accept
      this.store$.dispatch(
        new SocialStoreFriendsActions.AddFriendAction(addFriendRequest),
      );


    }, (response: {  error: SpotError }) => {
      this.friendRequestsError = response.error.message;
    });



  }

  declineFriendRequest(id: string): void {

    const request: DeclineFriendRequest = {
      friendRequestId: id,
    };

    this.friendsService.declineFriendRequests(request).pipe(take(1)).subscribe( (response: DeclineFriendRequestSuccess) => {

      this.friendRequests.forEach( (friend , i) => {
        if (friend.id === id) {
          this.friendRequests.splice(i, 1);
        }
      });

    }, (response: { error: SpotError }) => {

    });

  }

  deleteFriend(id: string): void {

    this.modalService.open('spot-confirm-modal');

    const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

    result$.subscribe( (result: { status: string }) => {

      if ( result.status === 'confirm' ) {

        // Delete the friend
        const request: DeleteFriendsRequest = {
          friendId: id,
        };

        this.store$.dispatch(
          new SocialStoreFriendsActions.DeleteFriendsRequestAction(request),
        );

      }

    });

  }

  deletePendingFriendRequest(id: string) {

    this.modalService.open('spot-confirm-modal');

    const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

    result$.subscribe( (result: { status: string }) => {

      if ( result.status === 'confirm' ) {

        // Delete the friend
        const request: DeletePendingFriendRequest = {
          friendRequestId: id,
        };

        this.friendsService.deletePendingFriendRequest(request).pipe(take(1)).subscribe( (response: DeletePendingFriendSuccess) => {

          this.pendingFriendRequests.forEach( (friend , i) => {
            if (friend.id === id) {
              this.friendRequests.splice(i, 1);
            }
          });
    
        }, (response: { error: SpotError }) => {
    
        });


      }

    });

  }

  facebookConnect(): void {

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
