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

  // Pending
  pendingFriendRequests: Friend[] = [];

  // Requests
  friendRequests: Friend[] = [];
  friendRequestsSuccess: string;
  friendRequestsError: string;

  // Friends
  friends$: Observable<Friend[]>;
  showNoFriendsIndicator$: Observable<boolean>;

  // facebook
  facebookConnected$: Observable<boolean>;
  facebookLoaded = false;

  // Input fields
  friendRequestUsername: string;
  friendSearch: string;

  constructor(
    private store$: Store<RootStoreState.State>,
    private friendService: FriendService,
    private authenticationService: AuthenticationService,
    private modalService: ModalService,
    private translateService: TranslateService
  ) {
    this.translateService.get('MAIN.FRIENDS').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.showNoFriendsIndicator$ = timer(1000)
      .pipe(mapTo(true), take(1))
      .pipe(startWith(false));

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.facebookConnected$ = this.store$.pipe(
      select(UserStoreSelectors.selectFacebookConnected)
    );

    // Get all friend requests
    const getFriendRequests: GetFriendRequestsRequest = {};

    this.friendService
      .getFriendRequests(getFriendRequests)
      .pipe(take(1))
      .subscribe(
        (response: GetFriendRequestsResponse) => {
          this.friendRequests = response.friendRequests;
        },
        (error: SpotError) => {}
      );

    // Get pending requests
    const getPendingFriendRequests: GetPendingFriendsRequest = {};

    this.friendService
      .getPendingFriends(getPendingFriendRequests)
      .pipe(take(1))
      .subscribe(
        (response: GetPendingFriendsResponse) => {
          this.pendingFriendRequests = response.pendingFriends;
        },
        (error: SpotError) => {}
      );

    // Get all friends
    const getFriends: GetFriendsRequest = {
      limit: null
    };

    this.store$.dispatch(
      new SocialStoreFriendActions.GetFriendsRequestAction(getFriends)
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

  addFriendRequest(): void {
    // Reset messages
    this.friendRequestsError = '';
    this.friendRequestsSuccess = '';

    if (
      typeof this.friendRequestUsername === 'undefined' ||
      this.friendRequestUsername.length === 0
    ) {
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
            this.pendingFriendRequests.push(response.friend);
          }
          this.friendRequestUsername = '';
        },
        (response: { error: SpotError }) => {
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
          this.friendRequests.forEach((friend, i) => {
            if (friend.friendId === response.friend.friendId) {
              this.friendRequests.splice(i, 1);
            }
          });

          const addFriendRequest: AddFriendToStore = {
            friend: response.friend
          };

          // accept
          this.store$.dispatch(
            new SocialStoreFriendActions.AddFriendAction(addFriendRequest)
          );
        },
        (response: { error: SpotError }) => {
          this.friendRequestsError = 'Error. Please try again';
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
        (response: DeclineFriendResponse) => {
          this.friendRequests.forEach((friend, i) => {
            if (friend.friendId === id) {
              this.friendRequests.splice(i, 1);
            }
          });
        },
        (response: { error: SpotError }) => {}
      );
  }

  deleteFriend(id: string): void {
    this.modalService
      .open('global', 'confirm')
      .pipe(take(1))
      .subscribe((result: ModalConfirmResult) => {
        if (result.status === ModalConfirmResultTypes.CONFIRM) {
          // Delete the friend
          const request: DeleteFriendRequest = {
            friendId: id
          };

          this.store$.dispatch(
            new SocialStoreFriendActions.DeleteFriendsRequestAction(request)
          );
        }
      });
  }

  deletePendingFriendRequest(id: string) {
    this.modalService
      .open('global', 'confirm')
      .pipe(take(1))
      .subscribe((result: ModalConfirmResult) => {
        if (result.status === ModalConfirmResultTypes.CONFIRM) {
          // Delete the friend
          const request: DeletePendingFriendRequest = {
            friendId: id
          };

          this.friendService
            .deletePendingFriend(request)
            .pipe(take(1))
            .subscribe(
              (response: DeletePendingFriendResponse) => {
                this.pendingFriendRequests.forEach((friend, i) => {
                  if (friend.friendId === id) {
                    this.pendingFriendRequests.splice(i, 1);
                  }
                });
              },
              (response: { error: SpotError }) => {}
            );
        }
      });
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
