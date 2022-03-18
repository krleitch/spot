import { Injectable } from '@angular/core';

// store
import { Actions, createEffect, ofType } from '@ngrx/effects';

// rxjs
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// Actions
import * as featureActions from './actions';
import * as spotActions from '@src/app/root-store/spot-store/actions';

// Services
import { CommentService } from '@services/comment.service';

// Models
import {
  DeleteCommentResponse,
  DeleteReplyResponse,
  RateCommentResponse,
  RateReplyResponse
} from '@models/comment';
import { SpotError } from '@exceptions/error';

@Injectable()
export class CommentStoreEffects {
  constructor(
    private commentService: CommentService,
    private actions$: Actions
  ) {}

  GenericFailureEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<featureActions.GenericFailureAction>(
          featureActions.ActionTypes.GENERIC_FAILURE
        ),
        tap((action) => {
          if (action.error.name === 'LocationError ') {
            this.commentService.failureMessage(
              'You are using an invalid location'
            );
          } else {
            this.commentService.failureMessage('Oops... Somethings went wrong');
          }
        })
      ),
    { dispatch: false }
  );

  deleteCommentEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.DeleteRequestAction>(
        featureActions.ActionTypes.DELETE_REQUEST
      ),
      switchMap((action) =>
        this.commentService.deleteComment(action.request).pipe(
          map(
            (response: DeleteCommentResponse) =>
              new featureActions.DeleteSuccessAction({
                response: response,
                spotId: action.request.spotId,
                commentId: action.request.commentId
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

  deleteReplyEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.DeleteReplyRequestAction>(
        featureActions.ActionTypes.DELETE_REPLY_REQUEST
      ),
      switchMap((action) =>
        this.commentService.deleteReply(action.request).pipe(
          map(
            (response: DeleteReplyResponse) =>
              new featureActions.DeleteReplySuccessAction({
                response: response,
                spotId: action.request.spotId,
                commentId: action.request.commentId,
                replyId: action.request.replyId
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

  rateCommentEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.RateRequestAction>(
        featureActions.ActionTypes.RATE_REQUEST
      ),
      switchMap((action) =>
        this.commentService.rateComment(action.request).pipe(
          map(
            (response: RateCommentResponse) =>
              new featureActions.RateSuccessAction({
                response: response,
                spotId: action.request.spotId,
                commentId: action.request.commentId,
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

  rateReplytEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.RateReplyRequestAction>(
        featureActions.ActionTypes.RATE_REPLY_REQUEST
      ),
      switchMap((action) =>
        this.commentService.rateReply(action.request).pipe(
          map(
            (response: RateReplyResponse) =>
              new featureActions.RateReplySuccessAction({
                response: response,
                spotId: action.request.spotId,
                commentId: action.request.commentId,
                replyId: action.request.replyId,
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

  addCommentEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.AddCommentRequestAction>(
        featureActions.ActionTypes.ADD_COMMENT_REQUEST
      ),
      tap((_action) => {
        // none
      }),
      switchMap((action) => [
        new spotActions.CreateCommentAction({
          spotId: action.request.comment.spotId
        })
      ])
    )
  );

  addReplyEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.AddReplyRequestAction>(
        featureActions.ActionTypes.ADD_REPLY_REQUEST
      ),
      tap((_action) => {
        // none
      }),
      switchMap((action) => [
        new spotActions.CreateCommentAction({
          spotId: action.request.reply.spotId
        })
      ])
    )
  );

  deleteCommentSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.DeleteSuccessAction>(
        featureActions.ActionTypes.DELETE_SUCCESS
      ),
      tap((_action) => {
        // none
      }),
      switchMap((action) => [
        new spotActions.DeleteCommentAction({ spotId: action.response.spotId })
      ])
    )
  );

  deleteReplySuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.DeleteReplySuccessAction>(
        featureActions.ActionTypes.DELETE_REPLY_SUCCESS
      ),
      tap((_action) => {
        // none
      }),
      switchMap((action) => [
        new spotActions.DeleteCommentAction({ spotId: action.response.spotId })
      ])
    )
  );
}
