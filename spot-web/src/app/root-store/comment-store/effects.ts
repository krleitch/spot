import { Injectable } from '@angular/core';

// store
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';

// rxjs
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// actions
import * as featureActions from './actions';
import * as spotActions from '@src/app/root-store/spot-store/actions';

// services
import { CommentService } from '../../services/comment.service';

// assets
import {
  DeleteCommentResponse,
  DeleteReplyResponse,
  RateCommentResponse,
  RateReplyResponse
} from '@models/comment';

@Injectable()
export class CommentStoreEffects {
  constructor(
    private commentService: CommentService,
    private actions$: Actions
  ) {}

  @Effect({ dispatch: false })
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      if (action.error.name === 'LocationError ') {
        this.commentService.failureMessage('You are using an invalid location');
      } else {
        this.commentService.failureMessage('Oops... Somethings went wrong');
      }
    })
  );

  @Effect()
  deleteCommentEffect$: Observable<Action> = this.actions$.pipe(
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
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  deleteReplyEffect$: Observable<Action> = this.actions$.pipe(
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
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  rateCommentEffect$: Observable<Action> = this.actions$.pipe(
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
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  rateReplytEffect$: Observable<Action> = this.actions$.pipe(
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
        catchError((errorResponse) =>
          observableOf(
            new featureActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  addCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddCommentRequestAction>(
      featureActions.ActionTypes.ADD_COMMENT_REQUEST
    ),
    tap((request: featureActions.AddCommentRequestAction) => {
      // none
    }),
    switchMap((action: featureActions.AddCommentRequestAction) => [
      new spotActions.CreateCommentAction({
        spotId: action.request.comment.spotId
      })
    ])
  );

  @Effect()
  addReplyEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddReplyRequestAction>(
      featureActions.ActionTypes.ADD_REPLY_REQUEST
    ),
    tap((request: featureActions.AddReplyRequestAction) => {
      // none
    }),
    switchMap((action: featureActions.AddReplyRequestAction) => [
      new spotActions.CreateCommentAction({
        spotId: action.request.reply.spotId
      })
    ])
  );

  @Effect()
  deleteCommentSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteSuccessAction>(
      featureActions.ActionTypes.DELETE_SUCCESS
    ),
    tap((request: featureActions.DeleteSuccessAction) => {
      // none
    }),
    switchMap((action: featureActions.DeleteSuccessAction) => [
      new spotActions.DeleteCommentAction({ spotId: action.response.spotId })
    ])
  );

  @Effect()
  deleteReplySuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteReplySuccessAction>(
      featureActions.ActionTypes.DELETE_REPLY_SUCCESS
    ),
    tap((request: featureActions.DeleteReplySuccessAction) => {
      // none
    }),
    switchMap((action: featureActions.DeleteReplySuccessAction) => [
      new spotActions.DeleteCommentAction({ spotId: action.response.spotId })
    ])
  );
}
