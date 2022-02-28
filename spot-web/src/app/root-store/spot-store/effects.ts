import { Injectable } from '@angular/core';

// rxjs
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// services
import { SpotService } from '@src/app/services/spot.service';

// store
import { Action } from '@ngrx/store';
import * as featureActions from './actions';
import { Actions, Effect, ofType } from '@ngrx/effects';

// Assets
import {
  CreateSpotResponse,
  DeleteSpotResponse,
  RateSpotResponse,
  GetSpotResponse,
  DeleteRatingResponse
} from '@models/../newModels/spot';

@Injectable()
export class SpotStoreEffects {
  constructor(private spotService: SpotService, private actions$: Actions) {}

  @Effect({ dispatch: false })
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      if (action.error.name === 'LocationError ') {
        this.spotService.failureMessage('You are using an invalid location');
      } else {
        this.spotService.failureMessage('Oops... Somethings went wrong');
      }
    })
  );

  @Effect()
  rateSpotEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RateRequestAction>(
      featureActions.ActionTypes.RATE_REQUEST
    ),
    switchMap((action) =>
      this.spotService.rateSpot(action.request).pipe(
        map(
          (response: RateSpotResponse) =>
            new featureActions.RateSuccessAction({
              response: response,
              spotId: action.request.spotId,
              rating: action.request.rating
            })
        ),
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  deleteRatingEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRatingRequestAction>(
      featureActions.ActionTypes.DELETE_RATING_REQUEST
    ),
    switchMap((action) =>
      this.spotService.deleteSpotRating(action.request).pipe(
        map(
          (response: DeleteRatingResponse) =>
            new featureActions.DeleteRatingSuccessAction({
              response: response,
              spotId: action.request.spotId
            })
        ),
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  deleteSpotEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap((action) =>
      this.spotService.deleteSpot(action.request).pipe(
        map(
          (response: DeleteSpotResponse) =>
            new featureActions.DeleteSuccessAction({
              response: response,
              spotId: action.request.spotId
            })
        ),
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );
}
