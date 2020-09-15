import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap, mergeMap } from 'rxjs/operators';

import * as featureActions from './actions';
import { CommentService } from '../../services/comments.service';
import { AddCommentSuccess, DeleteCommentSuccess, AddReplySuccess,
          DislikeCommentSuccess, LikeCommentSuccess, LoadRepliesSuccess, DeleteReplySuccess,
          DislikeReplySuccess, LikeReplySuccess } from '@models/comments';

@Injectable()
export class CommentsStoreEffects {
  constructor(private commentService: CommentService, private actions$: Actions) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      this.commentService.failureMessage(action.error);
    })
  );

  @Effect()
  addCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddRequestAction>(
      featureActions.ActionTypes.ADD_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .addComment(action.request)
        .pipe(
            map( (response: AddCommentSuccess) => new featureActions.AddSuccessAction(response)),
            catchError(errorResponse =>
              observableOf(new featureActions.AddFailureAction( errorResponse.error, action.request.postId ))
            )
          )
    )
  );

  @Effect()
  deleteCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .deleteComment(action.request)
        .pipe(
            map( (response: DeleteCommentSuccess) => new featureActions.DeleteSuccessAction(response)),
            catchError( errorResponse =>
              observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
            )
          )
    )
  );

  @Effect()
  addReplyEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddReplyRequestAction>(
      featureActions.ActionTypes.ADD_REPLY_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .addReply(action.request)
        .pipe(
            map( (response: AddReplySuccess) => new featureActions.AddReplySuccessAction(response)),
            catchError(errorResponse =>
              observableOf(new featureActions.AddReplyFailureAction( errorResponse.error, action.request.commentId ))
            )
          )
    )
  );

  @Effect()
  getRepliesEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GetReplyRequestAction>(
      featureActions.ActionTypes.GET_REPLY_REQUEST
    ),
    mergeMap(action =>
      this.commentService
        .getReplies(action.request)
        .pipe(
            map( (response: LoadRepliesSuccess) => {
              response.date = action.request.date;
              response.initialLoad = action.request.initialLoad;
              return new featureActions.GetReplySuccessAction(response);
            }),
            catchError( errorResponse =>
              observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
            )
          )
    )
  );

  @Effect()
  deleteReplyEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteReplyRequestAction>(
      featureActions.ActionTypes.DELETE_REPLY_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .deleteReply(action.request)
        .pipe(
            map( (response: DeleteReplySuccess) => new featureActions.DeleteReplySuccessAction(response)),
            catchError( errorResponse =>
              observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
            )
          )
    )
  );

  @Effect()
  dislikeCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DislikeRequestAction>(
      featureActions.ActionTypes.DISLIKE_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .dislikeComment(action.request)
        .pipe(
          map( (response: DislikeCommentSuccess) => new featureActions.DislikeSuccessAction(response)),
          catchError( errorResponse =>
            observableOf(new featureActions.GenericFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  likeCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LikeRequestAction>(
      featureActions.ActionTypes.LIKE_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .likeComment(action.request)
        .pipe(
          map( (response: LikeCommentSuccess) => new featureActions.LikeSuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  dislikeReplytEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DislikeReplyRequestAction>(
      featureActions.ActionTypes.DISLIKE_REPLY_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .dislikeReply(action.request)
        .pipe(
          map( (response: DislikeReplySuccess) => new featureActions.DislikeReplySuccessAction(response)),
          catchError( errorResponse =>
            observableOf(new featureActions.GenericFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  likeReplyEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LikeReplyRequestAction>(
      featureActions.ActionTypes.LIKE_REPLY_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .likeReply(action.request)
        .pipe(
          map( (response: LikeReplySuccess) => new featureActions.LikeReplySuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

}
