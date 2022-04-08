import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject, timer } from 'rxjs';
import { mapTo, startWith, take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  SocialStoreFriendActions,
  SocialStoreSelectors
} from '@store/social-store';
import {
  UserFacebookActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// Services
import { ModalService } from '@services/modal.service';
import { FriendService } from '@src/app/services/friend.service';
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import {
  AcceptFriendRequest,
  AcceptFriendResponse,
  CreateFriendRequest,
  CreateFriendResponse,
  AddFriendToStore,
  DeclineFriendRequest,
  DeclineFriendResponse,
  DeleteFriendRequest,
  DeletePendingFriendRequest,
  DeletePendingFriendResponse,
  Friend,
  GetFriendRequestsRequest,
  GetFriendRequestsResponse,
  GetFriendsRequest,
  GetPendingFriendsRequest,
  GetPendingFriendsResponse
} from '@models/friend';
import { FacebookConnectRequest } from '@models/user';
import { SpotError } from '@exceptions/error';
import { ModalConfirmResult, ModalConfirmResultTypes } from '@models/modal';

@Component({
  selector: 'spot-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  STRINGS;

  // Friend Requests Pending
  pendingFriendRequests: Friend[] = [];

  // Friend Requests
  friendRequests: Friend[] = [];
  friendRequestsError: string;

  // Friends
  friends$: Observable<Friend[]>;
  showNoFriendsIndicator$: Observable<boolean>;

  // facebook
  facebookConnected$: Observable<boolean>;
  facebookLoaded = false;

  // Input fields
  friendRequestUsername = '';
  friendSearch: string;

  constructor(
    private store$: Store<RootStoreState.State>,
    private friendService: FriendService,
    private authenticationService: AuthenticationService,
    private modalService: ModalService,
    private translateService: TranslateService
  ) {
    this.translateService.get('MAIN.FRIENDS').subscribe((res) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // wait a second before showing no friends
    this.showNoFriendsIndicator$ = timer(1000)
      .pipe(mapTo(true), take(1))
      .pipe(startWith(false));

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    // Get facebook connected status
    this.facebookConnected$ = this.store$.pipe(
      select(UserStoreSelectors.selectFacebookConnected)
    );

    // Get friend requests
    const getFriendRequestsRequest: GetFriendRequestsRequest = {};
    this.friendService
      .getFriendRequests(getFriendRequestsRequest)
      .pipe(take(1))
      .subscribe(
        (response: GetFriendRequestsResponse) => {
          this.friendRequests = response.friendRequests;
        },
        (_err: { error: SpotError }) => {}
      );

    // Get pending friend requests
    const getPendingFriendsRequest: GetPendingFriendsRequest = {};
    this.friendService
      .getPendingFriends(getPendingFriendsRequest)
      .pipe(take(1))
      .subscribe(
        (response: GetPendingFriendsResponse) => {
          this.pendingFriendRequests = response.pendingFriends;
        },
        (_err: { error: SpotError }) => {}
      );

    // Get all friends
    const getFriendsRequest: GetFriendsRequest = {
      limit: null
    };
    this.store$.dispatch(
      new SocialStoreFriendActions.GetFriendsRequestAction(getFriendsRequest)
    );
  }

  ngAfterViewInit(): void {
    this.authenticationService.socialServiceReady
      .pipe(takeUntil(this.onDestroy))
      .subscribe((service: string) => {
        if (service === 'FB') {
          setTimeout(() => {
            this.facebookLoaded = true;
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  createFriendRequest(): void {
    // Reset messages
    this.friendRequestsError = '';

    // username is required
    if (this.friendRequestUsername.length === 0) {
      this.friendRequestsError = this.STRINGS.USERNAME_REQUIRED;
      return;
    }

    // Send the friend request
    const request: CreateFriendRequest = {
      username: this.friendRequestUsername
    };
    this.friendService
      .createFriend(request)
      .pipe(take(1))
      .subscribe(
        (response: CreateFriendResponse) => {
          // check if we actually added the friend
          // in case they added us first already
          if (response.friend.confirmedAt) {
            this.friendRequests.forEach((friend, i) => {
              if (friend.friendId === response.friend.friendId) {
                this.friendRequests.splice(i, 1);
              }
            });
            // friend was added
            const addFriendRequest: AddFriendToStore = {
              friend: response.friend
            };
            // accept
            this.store$.dispatch(
              new SocialStoreFriendActions.AddFriendAction(addFriendRequest)
            );
          } else {
            // otherwise add to pending
            this.pendingFriendRequests.push(response.friend);
          }
          // reset the add username field
          this.friendRequestUsername = '';
        },
        (response: { error: SpotError }) => {
          // show the error message from the server
          // should be kept fairly generic
          this.friendRequestsError = response.error.message;
        }
      );
  }

  acceptFriendRequest(id: string): void {
    const request: AcceptFriendRequest = {
      friendRequestId: id
    };

    this.friendService
      .acceptFriendRequest(request)
      .pipe(take(1))
      .subscribe(
        (response: AcceptFriendResponse) => {
          // remove friend from requests
          this.friendRequests.forEach((friend, i) => {
            if (friend.friendId === response.friend.friendId) {
              this.friendRequests.splice(i, 1);
            }
          });

          // move the friend to added
          const addFriendToStore: AddFriendToStore = {
            friend: response.friend
          };
          this.store$.dispatch(
            new SocialStoreFriendActions.AddFriendAction(addFriendToStore)
          );
        },
        (_err: { error: SpotError }) => {
          this.friendRequestsError = this.STRINGS.FRIEND_REQUEST_ERROR;
        }
      );
  }

  declineFriendRequest(id: string): void {
    const request: DeclineFriendRequest = {
      friendRequestId: id
    };

    this.friendService
      .declineFriendRequest(request)
      .pipe(take(1))
      .subscribe(
        (_response: DeclineFriendResponse) => {
          this.friendRequests.forEach((friend, i) => {
            if (friend.friendId === id) {
              this.friendRequests.splice(i, 1);
            }
          });
        },
        (_err: { error: SpotError }) => {
          this.friendRequestsError = this.STRINGS.FRIEND_REQUEST_ERROR;
        }
      );
  }

  deleteFriend(id: string): void {
    this.modalService
      .open('global', 'confirm')
      .pipe(take(1))
      .subscribe((result: ModalConfirmResult) => {
        if (result.status === ModalConfirmResultTypes.CONFIRM) {
          // Delete the friend
          const deleteFriendRequest: DeleteFriendRequest = {
            friendId: id
          };
          this.store$.dispatch(
            new SocialStoreFriendActions.DeleteFriendsRequestAction(
              deleteFriendRequest
            )
          );
        }
      });
  }

  deletePendingFriendRequest(id: string) {
    const deletePendingFriendRequest: DeletePendingFriendRequest = {
      friendId: id
    };

    this.friendService
      .deletePendingFriend(deletePendingFriendRequest)
      .pipe(take(1))
      .subscribe(
        (_response: DeletePendingFriendResponse) => {
          this.pendingFriendRequests.forEach((friend, i) => {
            if (friend.friendId === id) {
              this.pendingFriendRequests.splice(i, 1);
            }
          });
        },
        (_err: { error: SpotError }) => {}
      );
  }

  facebookConnect(): void {
    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
        window['FB'].login((loginResponse) => {
          if (loginResponse.status === 'connected') {
            const request: FacebookConnectRequest = {
              accessToken: loginResponse.authResponse.accessToken
            };

            this.store$.dispatch(
              new UserFacebookActions.FacebookConnectRequestAction(request)
            );
          }
        });
      } else {
        // Already logged in to facebook
        const request: FacebookConnectRequest = {
          accessToken: statusResponse.authResponse.accessToken
        };

        this.store$.dispatch(
          new UserFacebookActions.FacebookConnectRequestAction(request)
        );
      }
    });
  }
}
