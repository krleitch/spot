import { Injectable } from '@angular/core';

// store
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';

// rxjs
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// actions
import * as featureActions from './actions';
import * as postsActions from '@store/posts-store/actions';

// services
import { CommentService } from '../../services/comments.service';

// assets
import { DeleteCommentSuccess, DislikeCommentSuccess, LikeCommentSuccess, DeleteReplySuccess,
          DislikeReplySuccess, LikeReplySuccess, UnratedCommentSuccess, UnratedReplySuccess } from '@models/comments';

@Injectable()
export class CommentsStoreEffects {
  constructor(private commentService: CommentService, private actions$: Actions) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      if ( action.error.name === 'LocationError ') {
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
  unratedCommentEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.UnratedRequestAction>(
      featureActions.ActionTypes.UNRATED_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .unratedComment(action.request)
        .pipe(
          map( (response: UnratedCommentSuccess) => new featureActions.UnratedSuccessAction(response)),
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

  @Effect()
  unratedReplyEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.UnratedReplyRequestAction>(
      featureActions.ActionTypes.UNRATED_REPLY_REQUEST
    ),
    switchMap(action =>
      this.commentService
        .unratedReply(action.request)
        .pipe(
          map( (response: UnratedReplySuccess) => new featureActions.UnratedReplySuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
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
    switchMap( (action: featureActions.AddCommentRequestAction ) => [
      new postsActions.AddCommentAction({ postId: action.request.postId })
    ]),
  );

  @Effect()
  addReplyEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddReplyRequestAction>(
      featureActions.ActionTypes.ADD_REPLY_REQUEST
    ),
    tap((request: featureActions.AddReplyRequestAction) => {
      // none
    }),
    switchMap( (action: featureActions.AddReplyRequestAction ) => [
      new postsActions.AddCommentAction({ postId: action.request.postId })
    ]),
  );

  @Effect()
  deleteCommentSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteSuccessAction>(
      featureActions.ActionTypes.DELETE_SUCCESS
    ),
    tap((request: featureActions.DeleteSuccessAction) => {
      // none
    }),
    switchMap( (action: featureActions.DeleteSuccessAction ) => [
      new postsActions.DeleteCommentAction({ postId: action.response.postId })
    ]),
  );

  @Effect()
  deleteReplySuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteReplySuccessAction>(
      featureActions.ActionTypes.DELETE_REPLY_SUCCESS
    ),
    tap((request: featureActions.DeleteReplySuccessAction) => {
      // none
    }),
    switchMap( (action: featureActions.DeleteReplySuccessAction ) => [
      new postsActions.DeleteCommentAction({ postId: action.response.postId })
    ]),
  );

}
