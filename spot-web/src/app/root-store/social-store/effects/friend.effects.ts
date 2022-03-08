import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { FriendService } from '@src/app/services/friend.service';
import * as friendActions from '../actions/friend.actions';
import { DeleteFriendResponse, GetFriendsResponse } from '@models/friend';

@Injectable()
export class FriendEffects {
  constructor(
    private actions$: Actions,
    private friendService: FriendService
  ) {}

  @Effect({ dispatch: false })
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendActions.GenericFailureAction>(
      friendActions.FriendsActionTypes.GENERIC_FAILURE
    ),
    tap((action: friendActions.GenericFailureAction) => {})
  );

  @Effect()
  getFriendsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendActions.GetFriendsRequestAction>(
      friendActions.FriendsActionTypes.GET_FRIENDS_REQUEST
    ),
    switchMap((action) =>
      this.friendService.getFriends(action.request).pipe(
        map((response: GetFriendsResponse) => {
          return new friendActions.GetFriendsSuccessAction(response);
        }),
        catchError((errorResponse) =>
          observableOf(
            new friendActions.GetFriendsFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  deleteFriendEffect$: Observable<Action> = this.actions$.pipe(
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
        catchError((errorResponse) =>
          observableOf(
            new friendActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );
}
