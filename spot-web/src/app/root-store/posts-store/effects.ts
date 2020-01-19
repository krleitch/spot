import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { PostsService } from '../../services/posts.service';
import * as featureActions from './actions';

import { DislikePostSuccess, LikePostSuccess } from '@models/posts';

@Injectable()
export class PostsStoreEffects {
  constructor(private postsService: PostsService, private actions$: Actions) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      this.postsService.failureMessage(action.error);
    })
  );

  @Effect()
  dislikePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DislikeRequestAction>(
      featureActions.ActionTypes.DISLIKE_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .dislikePost(action.request)
        .pipe(
          map( (response: DislikePostSuccess) => new featureActions.DislikeSuccessAction(response)),
          catchError( errorResponse =>
            observableOf(new featureActions.GenericFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  likePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LikeRequestAction>(
      featureActions.ActionTypes.LIKE_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .likePost(action.request)
        .pipe(
          map( (response: LikePostSuccess) => new featureActions.LikeSuccessAction(response)),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deletePostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(post =>
      this.postsService
        .deletePost(post.request)
        .pipe(
          map(response => new featureActions.LoadRequestAction()),
          catchError(error =>
            observableOf(new featureActions.DeleteFailureAction({ error }))
          )
        )
    )
  );

  @Effect()
  addPostEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddRequestAction>(
      featureActions.ActionTypes.ADD_REQUEST
    ),
    switchMap((post: featureActions.AddRequestAction) =>
      this.postsService
        .addPost(post.request)
        .pipe(
          map(response => new featureActions.LoadRequestAction()),
          catchError(error =>
            observableOf(new featureActions.AddFailureAction(error))
          )
        )
    )
  );

  @Effect()
  getRatingEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RatingRequestAction>(
      featureActions.ActionTypes.RATING_REQUEST
    ),
    switchMap((action: featureActions.RatingRequestAction) =>
      this.postsService
        .getPostRating(action.request)
        .pipe(
          map(response => new featureActions.RatingSuccessAction(response)),
          catchError(error =>
            observableOf(new featureActions.RatingFailureAction(error))
          )
        )
    )
  );

  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoadRequestAction>(
      featureActions.ActionTypes.LOAD_REQUEST
    ),
    switchMap(action =>
      this.postsService
        .getPosts()
        .pipe(
          map(
            items =>
              new featureActions.LoadSuccessAction({
                items
              })
          ),
          catchError(error =>
            observableOf(new featureActions.LoadFailureAction(error))
          )
        )
    )
  );
}
