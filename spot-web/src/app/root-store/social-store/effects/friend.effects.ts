import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as friendActions from '../actions/friend.actions';

// Services
import { FriendService } from '@src/app/services/friend.service';

// Models
import { DeleteFriendResponse, GetFriendsResponse } from '@models/friend';
import { SpotError } from '@exceptions/error';

@Injectable()
export class FriendEffects {
  constructor(
    private actions$: Actions,
    private friendService: FriendService
  ) {}

  GenericFailureEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<friendActions.GenericFailureAction>(
          friendActions.FriendsActionTypes.GENERIC_FAILURE
        ),
        tap((_action) => {
          // None
        })
      ),
    { dispatch: false }
  );

  getFriendsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<friendActions.GetFriendsRequestAction>(
        friendActions.FriendsActionTypes.GET_FRIENDS_REQUEST
      ),
      switchMap((action) =>
        this.friendService.getFriends(action.request).pipe(
          map((response: GetFriendsResponse) => {
            return new friendActions.GetFriendsSuccessAction(response);
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new friendActions.GetFriendsFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  deleteFriendEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<friendActions.DeleteFriendsRequestAction>(
        friendActions.FriendsActionTypes.DELETE_FRIEND_REQUEST
      ),
      switchMap((action) =>
        this.friendService.deleteFriend(action.request).pipe(
          map((response: DeleteFriendResponse) => {
            return new friendActions.DeleteFriendsSuccessAction({
              response: response,
              friendId: action.request.friendId
            });
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new friendActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );
}
