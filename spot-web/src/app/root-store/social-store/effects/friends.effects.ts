import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { FriendsService } from '@services/friends.service';
import * as friendsActions from '../actions/friends.actions';
import { DeleteFriendsRequest, DeleteFriendsSuccess, GetFriendsRequest, GetFriendsSuccess } from '@models/friends';

@Injectable()
export class FriendsEffects {
  constructor(private actions$: Actions, private friendsService: FriendsService) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GenericFailureAction>(
        friendsActions.FriendsActionTypes.GENERIC_FAILURE
    ),
    tap((action: friendsActions.GenericFailureAction) => {

    })
  );

  @Effect()
  getFriendsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.GetFriendsRequestAction>(
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
            observableOf(new friendsActions.GetFriendsFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deleteFriendsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<friendsActions.DeleteFriendsRequestAction>(
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
  
}
