import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap, mergeMap } from 'rxjs/operators';

import * as featureActions from './actions';
import { CommentService } from '../../services/comments.service';
import { AddCommentSuccess, LoadCommentsSuccess, DeleteCommentSuccess, AddReplySuccess, LoadRepliesSuccess, DeleteReplySuccess } from '@models/comments';

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
              observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
            )
          )
    )
  );

  @Effect()
  getCommentsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GetRequestAction>(
      featureActions.ActionTypes.GET_REQUEST
    ),
    mergeMap(action =>
      this.commentService
        .getComments(action.request)
        .pipe(
            map( (response: LoadCommentsSuccess) => new featureActions.GetSuccessAction(response)),
            catchError( errorResponse =>
              observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
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
              observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
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
            map( (response: LoadRepliesSuccess) => new featureActions.GetReplySuccessAction(response)),
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

}
