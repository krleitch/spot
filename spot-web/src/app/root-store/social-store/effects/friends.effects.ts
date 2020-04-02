import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { FriendsService } from '@services/friends.service';
import * as friendsActions from '../actions/friends.actions';
import { GetFriendRequestsSuccess, AddFriendRequestsSuccess } from '@models/friends';


@Injectable()
export class FriendsEffects {
  constructor(private actions$: Actions, private friendsService: FriendsService) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GenericFailureAction>(
        friendsActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: friendsActions.GenericFailureAction) => {
      this.friendsService.failureMessage(action.error);
    })
  );

  @Effect()
  getFriendRequestsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GetFriendRequestsAction>(
      friendsActions.ActionTypes.GET_FRIEND_REQUESTS_REQUEST
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
      friendsActions.ActionTypes.ADD_FRIEND_REQUESTS_REQUEST
    ),
    switchMap(action =>
      this.friendsService
        .addFriendRequests(action.request)
        .pipe(
          map((response: AddFriendRequestsSuccess) => {
            return new friendsActions.AddFriendRequestsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new friendsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

}
