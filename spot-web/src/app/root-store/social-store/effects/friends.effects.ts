import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { FriendsService } from '@services/friends.service';
import * as friendsActions from '../actions/friends.actions';
import { GetFriendRequestsSuccess, AddFriendRequestsSuccess, DeleteFriendRequestsSuccess,
            AcceptFriendRequestsSuccess, DeclineFriendRequestsSuccess, GetFriendsSuccess,
            DeleteFriendsSuccess } from '@models/friends';


@Injectable()
export class FriendsEffects {
  constructor(private actions$: Actions, private friendsService: FriendsService) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GenericFailureAction>(
        friendsActions.FriendsActionTypes.GENERIC_FAILURE
    ),
    tap((action: friendsActions.GenericFailureAction) => {
      this.friendsService.failureMessage(action.error);
    })
  );

  @Effect()
  getFriendsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GetFriendsAction>(
      friendsActions.FriendsActionTypes.GET_FRIENDS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .getFriends(action.request)
        .pipe(
          map((response: GetFriendsSuccess) => {
            return new friendsActions.GetFriendsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deleteFriendsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.DeleteFriendsAction>(
      friendsActions.FriendsActionTypes.DELETE_FRIENDS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .deleteFriends(action.request)
        .pipe(
          map((response: DeleteFriendsSuccess) => {
            return new friendsActions.DeleteFriendsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  getFriendRequestsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GetFriendRequestsAction>(
      friendsActions.FriendsActionTypes.GET_FRIEND_REQUESTS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .getFriendRequests(action.request)
        .pipe(
          map((response: GetFriendRequestsSuccess) => {
            return new friendsActions.GetFriendRequestsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  addFriendRequestsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.AddFriendRequestsAction>(
      friendsActions.FriendsActionTypes.ADD_FRIEND_REQUESTS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .addFriendRequests(action.request)
        .pipe(
          map((response: AddFriendRequestsSuccess) => {
            this.friendsService.successMessage('Friend request sent');
            return new friendsActions.AddFriendRequestsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.AddFriendRequestsFailureAction( errorResponse.error ))
          )
        )
    )
  );

//   @Effect()
//   deleteFriendRequestsEffect$: Observable<Action> = this.actions$.pipe(
//     ofType<friendsActions.DeleteFriendRequestsAction>(
//       friendsActions.FriendsActionTypes.DELETE_FRIEND_REQUESTS_REQUEST
//     ),
//     switchMap(action =>
//       this.friendsService
//         .deleteFriendRequests(action.request)
//         .pipe(
//           map((response: DeleteFriendRequestsSuccess) => {
//             return new friendsActions.DeleteFriendRequestsSuccessAction( response );
//           }),
//           catchError(errorResponse =>
//             observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
//           )
//         )
//     )
//   );

  @Effect()
  acceptFriendRequestsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.AcceptFriendRequestsAction>(
      friendsActions.FriendsActionTypes.ACCEPT_FRIEND_REQUESTS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .acceptFriendRequests(action.request)
        .pipe(
          map((response: AcceptFriendRequestsSuccess) => {
            return new friendsActions.AcceptFriendRequestsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  declineFriendRequestsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.DeclineFriendRequestsAction>(
      friendsActions.FriendsActionTypes.DECLINE_FRIEND_REQUESTS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .declineFriendRequests(action.request)
        .pipe(
          map((response: DeclineFriendRequestsSuccess) => {
            return new friendsActions.DeclineFriendRequestsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

}
