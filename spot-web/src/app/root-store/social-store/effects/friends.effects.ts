import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { FriendsService } from '@services/friends.service';
import * as friendsActions from '../actions/friends.actions';
import { } from '@models/friends';


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

//   @Effect()
//   getNotificationsEffect$: Observable<Action> = this.actions$.pipe(
//     ofType<featureActions.GetNotificationsAction>(
//       featureActions.ActionTypes.GET_NOTIFICATIONS_REQUEST
//     ),
//     switchMap(action =>
//       this.notificationsService
//         .getNotifications(action.request)
//         .pipe(
//           map((response: GetNotificationsSuccess) => {
//             response.offset = action.request.offset;
//             return new featureActions.GetNotificationsSuccessAction( response );
//           }),
//           catchError(errorResponse =>
//             observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
//           )
//         )
//     )
//   );

}
