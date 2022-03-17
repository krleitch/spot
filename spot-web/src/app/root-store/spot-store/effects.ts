import { Injectable } from '@angular/core';

// rxjs
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// services
import { SpotService } from '@src/app/services/spot.service';

// store
import * as featureActions from './actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';

// Assets
import {
  DeleteSpotResponse,
  RateSpotResponse,
  DeleteRatingResponse
} from '@models/spot';
import { SpotError } from '@exceptions/error';

@Injectable()
export class SpotStoreEffects {
  constructor(private spotService: SpotService, private actions$: Actions) {}

  GenericFailureEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<featureActions.GenericFailureAction>(
          featureActions.ActionTypes.GENERIC_FAILURE
        ),
        tap((action) => {
          if (action.error.name === 'LocationError ') {
            this.spotService.failureMessage(
              'You are using an invalid location'
            );
          } else {
            this.spotService.failureMessage('Oops... Somethings went wrong');
          }
        })
      ),
    { dispatch: false }
  );

  rateSpotEffect$ = createEffect(() =>
    this.actions$.pipe(
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
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new featureActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  deleteRatingEffect$ = createEffect(() =>
    this.actions$.pipe(
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
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new featureActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  deleteSpotEffect$ = createEffect(() =>
    this.actions$.pipe(
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
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new featureActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );
}
