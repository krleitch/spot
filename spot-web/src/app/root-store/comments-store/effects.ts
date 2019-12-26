import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as featureActions from './actions';
import { CommentService } from '../../services/comments.service';


@Injectable()
export class CommentsStoreEffects {
  constructor(private commentService: CommentService, private actions$: Actions) { }
          
  @Effect()
  addCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddRequestAction>(
      featureActions.ActionTypes.ADD_REQUEST
    ),
    switchMap(addCommentRequest =>
      this.commentService
        .addComment(addCommentRequest.request.postId, addCommentRequest.request.body)
        .pipe(
            map(response => new featureActions.GetRequestAction({ postId: addCommentRequest.request.postId })),
            catchError(error =>
              observableOf(new featureActions.AddFailureAction({ error }))
            )
          )
    )
  );

  @Effect()
  getCommentsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GetRequestAction>(
      featureActions.ActionTypes.GET_REQUEST
    ),
    mergeMap(registerRequest =>
      this.commentService
        .getComments(registerRequest.request.postId)
        .pipe(
            map(response => new featureActions.GetSuccessAction({ postId: registerRequest.request.postId, comments: response })),
            catchError(error =>
              observableOf(new featureActions.GetFailureAction({ error }))
            )
          )
    )
  );
  
  @Effect()
  deleteCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(deleteRequest =>
      this.commentService
        .deleteComment(deleteRequest.request.commentId)
        .pipe(
            map(response => new featureActions.GetRequestAction({ postId: deleteRequest.request.postId })),
            catchError(error =>
              observableOf(new featureActions.DeleteFailureAction({ error }))
            )
          )
    )
  );

}
